package com.grgabriellaromeo.app.data.repositories

import com.grgabriellaromeo.app.BuildConfig
import com.grgabriellaromeo.app.data.SupabaseClient
import com.grgabriellaromeo.app.data.models.CartItem
import io.github.jan.supabase.postgrest.from
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.net.HttpURLConnection
import java.net.URL

class OrderRepository {
    private val client = SupabaseClient.client
    private val json = Json {
        ignoreUnknownKeys = true
        encodeDefaults = true
    }

    @Serializable
    data class CheckoutCartItem(
        val cartItem: Boolean = true,
        val id: String,
        val nome: String,
        val immagine: String? = null,
        val prezzo: Double,
        val taglia: String? = null,
        val disponibile: Boolean = true,
        @SerialName("made_to_order") val madeToOrder: Boolean = false,
        @SerialName("allow_backorder") val allowBackorder: Boolean = false,
        val offerta: Boolean = false,
        val sconto: Double = 0.0,
        val quantita: Int
    )

    @Serializable
    data class QuoteRequest(
        val cart: List<CheckoutCartItem>,
        val shippingMethod: String
    )

    @Serializable
    data class ProductionItem(
        val id: String,
        val nome: String,
        val requestedQuantity: Int,
        val availableQuantity: Int
    )

    @Serializable
    data class CheckoutQuote(
        val shippingMethod: String,
        val shippingCost: Double,
        val subtotal: Double,
        val firstDiscountPercent: Double,
        val discountAmount: Double,
        val total: Double,
        val productionPolicyRequired: Boolean = false,
        val productionItems: List<ProductionItem> = emptyList()
    )

    @Serializable
    data class QuoteResponse(
        val ok: Boolean? = null,
        val quote: CheckoutQuote
    )

    @Serializable
    data class FinalizeRequest(
        val cart: List<CheckoutCartItem>,
        val shippingMethod: String,
        val paymentMethod: String,
        val paymentStatus: String,
        val transactionId: String? = null,
        val productionPolicyAccepted: Boolean
    )

    @Serializable
    data class FinalizeResponse(
        val ok: Boolean? = null,
        val orderId: String,
        val total: Double? = null
    )

    @Serializable
    data class ApiError(val error: String? = null)

    suspend fun quote(
        items: List<CartItem>,
        shippingMethod: String,
        accessToken: String
    ): CheckoutQuote {
        val payload = QuoteRequest(items.toCheckoutCart(), shippingMethod)
        return postJson<QuoteRequest, QuoteResponse>("api/checkout/quote", payload, accessToken).quote
    }

    suspend fun finalizeCheckout(
        items: List<CartItem>,
        shippingMethod: String,
        paymentMethod: String,
        paymentStatus: String,
        accessToken: String,
        productionPolicyAccepted: Boolean
    ): FinalizeResponse {
        val payload = FinalizeRequest(
            cart = items.toCheckoutCart(),
            shippingMethod = shippingMethod,
            paymentMethod = paymentMethod,
            paymentStatus = paymentStatus,
            productionPolicyAccepted = productionPolicyAccepted
        )
        return postJson("api/checkout/finalize", payload, accessToken)
    }

    suspend fun trackVisit(page: String, lang: String) {
        runCatching {
            client.from("user_tracking").insert(
                mapOf("pagina" to page, "lingua" to lang)
            )
        }
    }

    private fun List<CartItem>.toCheckoutCart(): List<CheckoutCartItem> =
        map {
            CheckoutCartItem(
                id = it.productId,
                nome = it.name,
                immagine = it.imageUrl,
                prezzo = it.price,
                taglia = it.taglia,
                disponibile = it.disponibile,
                madeToOrder = it.madeToOrder,
                allowBackorder = it.allowBackorder,
                offerta = it.offerta,
                sconto = it.sconto,
                quantita = it.quantity
            )
        }

    private suspend inline fun <reified Req : Any, reified Res : Any> postJson(
        path: String,
        payload: Req,
        accessToken: String
    ): Res = withContext(Dispatchers.IO) {
        val base = BuildConfig.SITE_URL.trimEnd('/')
        val connection = URL("$base/$path").openConnection() as HttpURLConnection
        connection.requestMethod = "POST"
        connection.setRequestProperty("Content-Type", "application/json")
        connection.setRequestProperty("Authorization", "Bearer $accessToken")
        connection.doOutput = true
        connection.outputStream.use { stream ->
            stream.write(json.encodeToString(payload).toByteArray())
        }

        val body = runCatching {
            val stream = if (connection.responseCode in 200..299) connection.inputStream else connection.errorStream
            stream?.bufferedReader()?.use { it.readText() }.orEmpty()
        }.getOrDefault("")

        if (connection.responseCode !in 200..299) {
            val message = runCatching { json.decodeFromString<ApiError>(body).error }.getOrNull()
            throw IllegalStateException(message ?: "HTTP ${connection.responseCode}")
        }

        json.decodeFromString(body)
    }
}
