package com.grgabriellaromeo.app.data.repositories

import com.grgabriellaromeo.app.BuildConfig
import com.grgabriellaromeo.app.GRApplication
import com.grgabriellaromeo.app.data.SupabaseClient
import com.grgabriellaromeo.app.data.models.Product
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Order
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.doubleOrNull
import kotlinx.serialization.json.intOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.OkHttpClient
import okhttp3.Request
import java.util.concurrent.TimeUnit

class ProductRepository {
    private val db = SupabaseClient.client
    private val json = Json { ignoreUnknownKeys = true; coerceInputValues = true }
    private val http = OkHttpClient.Builder()
        .connectTimeout(20, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .writeTimeout(20, TimeUnit.SECONDS)
        .retryOnConnectionFailure(true)
        .build()

    suspend fun getAll(): List<Product> =
        getProductsWithCache()

    suspend fun getByCategory(categoria: String): List<Product> =
        getProductsWithCache { it.categoria == categoria }

    suspend fun getOfferte(): List<Product> =
        getProductsWithCache { it.offerta }

    suspend fun search(query: String): List<Product> =
        getProductsWithCache {
            val q = query.trim()
            q.isBlank() ||
                it.nome.contains(q, ignoreCase = true) ||
                it.descrizione?.contains(q, ignoreCase = true) == true ||
                it.categoria.contains(q, ignoreCase = true) ||
                it.sottocategoria?.contains(q, ignoreCase = true) == true
        }

    suspend fun getById(id: String): Product? =
        runCatching {
            getProductsViaRest(id = id).firstOrNull()
        }.getOrElse {
            loadCachedProducts().firstOrNull { product -> product.id == id }
                ?: db.from("products").select {
                    filter { eq("id", id) }
                }.decodeSingleOrNull()
        }

    private suspend fun getProductsViaRest(
        categoria: String? = null,
        onlyOffers: Boolean = false,
        search: String? = null,
        id: String? = null
    ): List<Product> = withContext(Dispatchers.IO) {
        val urlBuilder = "${BuildConfig.SUPABASE_URL.trimEnd('/')}/rest/v1/products"
            .toHttpUrl()
            .newBuilder()
            .addQueryParameter("select", "*")
            .addQueryParameter("order", "created_at.desc.nullslast")

        categoria?.let { urlBuilder.addQueryParameter("categoria", "eq.$it") }
        id?.let { urlBuilder.addQueryParameter("id", "eq.$it") }
        if (onlyOffers) urlBuilder.addQueryParameter("offerta", "eq.true")
        val normalizedSearch = search?.trim().orEmpty()
        if (normalizedSearch.isNotEmpty()) {
            val escaped = normalizedSearch.replace(",", " ")
            urlBuilder.addQueryParameter(
                "or",
                "(nome.ilike.*$escaped*,descrizione.ilike.*$escaped*,categoria.ilike.*$escaped*,sottocategoria.ilike.*$escaped*)"
            )
        }

        val request = Request.Builder()
            .url(urlBuilder.build())
            .get()
            .addHeader("apikey", BuildConfig.SUPABASE_ANON_KEY)
            .addHeader("Authorization", "Bearer ${BuildConfig.SUPABASE_ANON_KEY}")
            .addHeader("Accept", "application/json")
            .build()

        http.newCall(request).execute().use { response ->
            val body = response.body?.string().orEmpty()
            if (!response.isSuccessful) {
                throw IllegalStateException("Supabase REST ${response.code}: $body")
            }
            json.parseToJsonElement(body).jsonArray.map { decodeProduct(it.jsonObject) }
        }
    }

    private suspend fun getProductsWithCache(
        predicate: (Product) -> Boolean = { true }
    ): List<Product> = runCatching {
        getProductsViaRest().filter(predicate)
    }.getOrElse {
        loadCachedProducts().filter(predicate)
    }

    private suspend fun loadCachedProducts(): List<Product> = withContext(Dispatchers.IO) {
        GRApplication.appContext.assets.open("products.json").use { stream ->
            val body = stream.bufferedReader().use { it.readText() }
            json.parseToJsonElement(body).jsonArray.map { decodeProduct(it.jsonObject) }
        }
    }

    private fun decodeProduct(obj: JsonObject): Product = Product(
        id = obj.string("id"),
        nome = obj.string("nome"),
        nomeEn = obj.nullableString("nome_en"),
        nomeFr = obj.nullableString("nome_fr"),
        nomeDe = obj.nullableString("nome_de"),
        nomeEs = obj.nullableString("nome_es"),
        nomeAr = obj.nullableString("nome_ar"),
        nomeZh = obj.nullableString("nome_zh"),
        nomeJa = obj.nullableString("nome_ja"),
        descrizione = obj.nullableString("descrizione"),
        descrizioneEn = obj.nullableString("descrizione_en"),
        descrizioneFr = obj.nullableString("descrizione_fr"),
        descrizioneDe = obj.nullableString("descrizione_de"),
        descrizioneEs = obj.nullableString("descrizione_es"),
        descrizioneAr = obj.nullableString("descrizione_ar"),
        descrizioneZh = obj.nullableString("descrizione_zh"),
        descrizioneJa = obj.nullableString("descrizione_ja"),
        prezzo = obj.double("prezzo"),
        prezzoScontato = obj.nullableDouble("prezzo_scontato"),
        categoria = obj.string("categoria"),
        sottocategoria = obj.nullableString("sottocategoria"),
        immagine = obj.nullableString("immagine"),
        immagini = obj.imagesCsv(),
        taglia = obj.nullableString("taglia"),
        colori = obj.nullableString("colori"),
        disponibile = obj.boolean("disponibile", true),
        offerta = obj.boolean("offerta", false),
        sconto = obj.nullableDouble("sconto"),
        quantita = obj.nullableInt("quantita"),
        madeToOrder = obj.nullableBoolean("made_to_order"),
        allowBackorder = obj.nullableBoolean("allow_backorder"),
        createdAt = obj.nullableString("created_at")
    )

    private fun JsonObject.imagesCsv(): String? {
        val raw = this["immagini"] ?: return null
        raw.jsonPrimitiveOrNull()?.contentOrNull?.let { return it }
        return runCatching {
            raw.jsonArray.joinToString(",") { it.jsonPrimitive.content }
        }.getOrNull()
    }

    private fun JsonObject.string(key: String): String =
        nullableString(key).orEmpty()

    private fun JsonObject.nullableString(key: String): String? =
        this[key]?.jsonPrimitiveOrNull()?.contentOrNull

    private fun JsonObject.double(key: String): Double =
        nullableDouble(key) ?: 0.0

    private fun JsonObject.nullableDouble(key: String): Double? =
        this[key]?.jsonPrimitiveOrNull()?.let { it.doubleOrNull ?: it.contentOrNull?.parsePriceString() }

    private fun JsonObject.nullableInt(key: String): Int? =
        this[key]?.jsonPrimitiveOrNull()?.let { it.intOrNull ?: it.contentOrNull?.toIntOrNull() }

    private fun JsonObject.boolean(key: String, fallback: Boolean): Boolean =
        nullableBoolean(key) ?: fallback

    private fun JsonObject.nullableBoolean(key: String): Boolean? =
        this[key]?.jsonPrimitiveOrNull()?.let { it.booleanOrNull ?: it.contentOrNull?.toBooleanStrictOrNull() }

    private fun kotlinx.serialization.json.JsonElement.jsonPrimitiveOrNull(): JsonPrimitive? =
        runCatching { jsonPrimitive }.getOrNull()

    private fun String.parsePriceString(): Double? {
        val cleaned = trim()
            .replace(Regex("[^0-9,.-]"), "")
            .replace(Regex("\\.(?=\\d{3}(\\D|$))"), "")
            .replace(',', '.')

        return cleaned.toDoubleOrNull()
    }
}
