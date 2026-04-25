package com.grgabriellaromeo.app.data.repositories

import com.grgabriellaromeo.app.BuildConfig
import com.grgabriellaromeo.app.data.SupabaseClient
import com.grgabriellaromeo.app.data.models.Cliente
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.auth.providers.builtin.Email
import io.github.jan.supabase.postgrest.from
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
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
    private data class ApiError(val error: String? = null)

    suspend fun login(email: String, password: String) {
        auth.signInWith(Email) {
            this.email = email
            this.password = password
        }
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

    suspend fun getCliente(userId: String): Cliente? =
        client.from("clienti").select {
            filter { eq("id", userId) }
        }.decodeSingleOrNull()

    suspend fun updateCliente(cliente: Cliente) {
        client.from("clienti").update(cliente) {
            filter { eq("id", cliente.id) }
        }
    }

    suspend fun markPrimoScontoUsed(userId: String) {
        client.from("clienti").update(mapOf("primo_sconto" to false)) {
            filter { eq("id", userId) }
        }
    }

    private suspend fun postSignup(payload: SignupPayload) = withContext(Dispatchers.IO) {
        val base = BuildConfig.SITE_URL.trimEnd('/')
        val connection = URL("$base/api/auth/signup").openConnection() as HttpURLConnection
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
}
