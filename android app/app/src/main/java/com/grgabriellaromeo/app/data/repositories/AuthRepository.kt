package com.grgabriellaromeo.app.data.repositories

import com.grgabriellaromeo.app.BuildConfig
import com.grgabriellaromeo.app.data.SupabaseClient
import com.grgabriellaromeo.app.data.models.Cliente
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.auth.exception.AuthRestException
import io.github.jan.supabase.auth.providers.builtin.Email
import io.github.jan.supabase.exceptions.HttpRequestException
import io.github.jan.supabase.postgrest.from
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext
import io.ktor.client.plugins.HttpRequestTimeoutException
import kotlinx.serialization.Serializable
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.net.HttpURLConnection
import java.net.URL

class AuthRepository {
    private val client = SupabaseClient.client
    private val auth = client.auth
    private val json = Json { ignoreUnknownKeys = true; encodeDefaults = true }

    @Serializable
    private data class SignupPayload(
        val email: String,
        val password: String,
        val nome: String,
        val cognome: String,
        val paese: String = "Italia",
        val citta: String = "",
        val indirizzo: String = "",
        val codice_postale: String = "",
        val telefono1: String,
        val telefono2: String? = null
    )

    @Serializable
    private data class ProfilePayload(
        val email: String,
        val nome: String,
        val cognome: String,
        val telefono1: String? = null,
        val telefono2: String? = null,
        val indirizzo: String? = null,
        val citta: String? = null,
        val paese: String? = null,
        val codice_postale: String? = null
    )

    @Serializable
    private data class ProfileResponse(
        val ok: Boolean? = null,
        val customer: Cliente? = null
    )

    @Serializable
    private data class ApiError(val error: String? = null)

    suspend fun login(email: String, password: String) = withContext(Dispatchers.IO) {
        val normalizedEmail = email.trim()
        var lastError: Throwable? = null

        repeat(LOGIN_MAX_ATTEMPTS) { attempt ->
            try {
                auth.signInWith(Email) {
                    this.email = normalizedEmail
                    this.password = password
                }
                return@withContext
            } catch (error: Throwable) {
                lastError = error
                val isLastAttempt = attempt == LOGIN_MAX_ATTEMPTS - 1
                if (!isRetryableLoginError(error) || isLastAttempt) {
                    throw error
                }
                delay(loginRetryDelayMs(attempt))
            }
        }

        throw lastError ?: IllegalStateException("Login failed")
    }

    suspend fun register(
        email: String,
        password: String,
        nome: String,
        cognome: String,
        telefono: String
    ) {
        val payload = SignupPayload(
            email = email.trim(),
            password = password,
            nome = nome,
            cognome = cognome,
            telefono1 = telefono
        )
        postSignup(payload)
        login(email, password)
    }

    suspend fun logout() {
        auth.signOut()
    }

    fun currentUser() = auth.currentUserOrNull()

    fun currentAccessToken(): String? = auth.currentSessionOrNull()?.accessToken

    suspend fun getCliente(userId: String, email: String? = null): Cliente? {
        val byUserId = client.from("clienti").select {
            filter { eq("user_id", userId) }
        }.decodeSingleOrNull<Cliente>()
        if (byUserId != null) return byUserId

        val normalizedEmail = email?.trim()?.lowercase().takeUnless { it.isNullOrBlank() }
        return normalizedEmail?.let {
            client.from("clienti").select {
                filter { eq("email", it) }
            }.decodeSingleOrNull()
        }
    }

    suspend fun updateCliente(cliente: Cliente) {
        val token = currentAccessToken()
        if (token != null) {
            val payload = ProfilePayload(
                email = cliente.email,
                nome = cliente.nome,
                cognome = cliente.cognome,
                telefono1 = cliente.telefono1,
                telefono2 = cliente.telefono2,
                indirizzo = cliente.indirizzo,
                citta = cliente.citta,
                paese = cliente.paese,
                codice_postale = cliente.codicePostale
            )
            postProfile(payload, token)
        } else {
            client.from("clienti").update(cliente) {
                filter { eq("id", cliente.id) }
            }
        }
    }

    suspend fun markPrimoScontoUsed(userId: String) {
        client.from("clienti").update(mapOf("primo_sconto" to null)) {
            filter { eq("user_id", userId) }
        }
    }

    private suspend fun postSignup(payload: SignupPayload) = withContext(Dispatchers.IO) {
        val base = BuildConfig.SITE_URL.trimEnd('/')
        val connection = URL("$base/api/auth/signup").openConnection() as HttpURLConnection
        connection.connectTimeout = 30_000
        connection.readTimeout = 30_000
        connection.requestMethod = "POST"
        connection.setRequestProperty("Content-Type", "application/json")
        connection.doOutput = true
        connection.outputStream.use { it.write(json.encodeToString(payload).toByteArray()) }

        val body = runCatching {
            val stream = if (connection.responseCode in 200..299) connection.inputStream else connection.errorStream
            stream?.bufferedReader()?.use { it.readText() }.orEmpty()
        }.getOrDefault("")

        if (connection.responseCode !in 200..299) {
            val message = runCatching { json.decodeFromString<ApiError>(body).error }.getOrNull()
            throw IllegalStateException(message ?: "HTTP ${connection.responseCode}")
        }
    }

    private suspend fun postProfile(payload: ProfilePayload, accessToken: String): Cliente = withContext(Dispatchers.IO) {
        val base = BuildConfig.SITE_URL.trimEnd('/')
        val connection = URL("$base/api/auth/profile").openConnection() as HttpURLConnection
        connection.connectTimeout = 30_000
        connection.readTimeout = 30_000
        connection.requestMethod = "POST"
        connection.setRequestProperty("Content-Type", "application/json")
        connection.setRequestProperty("Authorization", "Bearer $accessToken")
        connection.doOutput = true
        connection.outputStream.use { it.write(json.encodeToString(payload).toByteArray()) }

        val body = runCatching {
            val stream = if (connection.responseCode in 200..299) connection.inputStream else connection.errorStream
            stream?.bufferedReader()?.use { it.readText() }.orEmpty()
        }.getOrDefault("")

        if (connection.responseCode !in 200..299) {
            val message = runCatching { json.decodeFromString<ApiError>(body).error }.getOrNull()
            throw IllegalStateException(message ?: "HTTP ${connection.responseCode}")
        }

        json.decodeFromString<ProfileResponse>(body).customer
            ?: throw IllegalStateException("Customer profile not available")
    }

    private fun isRetryableLoginError(error: Throwable): Boolean {
        if (error is AuthRestException) return false
        return error is HttpRequestException || error is HttpRequestTimeoutException
    }

    private fun loginRetryDelayMs(attempt: Int): Long {
        return when (attempt) {
            0 -> 500L
            1 -> 1_200L
            else -> 2_000L
        }
    }

    companion object {
        private const val LOGIN_MAX_ATTEMPTS = 3
    }
}
