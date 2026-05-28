package com.grgabriellaromeo.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.grgabriellaromeo.app.BuildConfig
import com.grgabriellaromeo.app.data.models.CartItem
import com.grgabriellaromeo.app.data.models.Cliente
import com.grgabriellaromeo.app.data.repositories.AuthRepository
import com.grgabriellaromeo.app.data.repositories.OrderRepository
import com.grgabriellaromeo.app.data.repositories.OrderRepository.CheckoutQuote
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class CheckoutState {
    object Idle : CheckoutState()
    object Loading : CheckoutState()
    object Success : CheckoutState()
    data class Error(val message: String) : CheckoutState()
}

data class StripePaymentRequest(
    val clientSecret: String,
    val paymentIntentId: String
)

data class PayPalApprovalRequest(
    val orderId: String,
    val approvalUrl: String
)

class CheckoutViewModel : ViewModel() {
    private val orderRepo = OrderRepository()
    private val authRepo = AuthRepository()

    private val _state = MutableStateFlow<CheckoutState>(CheckoutState.Idle)
    val state: StateFlow<CheckoutState> = _state

    var nome = MutableStateFlow("")
    var cognome = MutableStateFlow("")
    var email = MutableStateFlow("")
    var telefono = MutableStateFlow("")
    var indirizzo = MutableStateFlow("")
    var citta = MutableStateFlow("")
    var cap = MutableStateFlow("")
    var provincia = MutableStateFlow("")
    var nazione = MutableStateFlow("Italia")
    var note = MutableStateFlow("")
    var metodoPagamento = MutableStateFlow("carta")
    var codiceSconto = MutableStateFlow("")
    var scontoApplicato = MutableStateFlow(false)
    var quote = MutableStateFlow<CheckoutQuote?>(null)
    var productionPolicyAccepted = MutableStateFlow(false)
    var shippingMethod = MutableStateFlow("ritiro")
    var lastConfirmedPaymentMethod = MutableStateFlow<String?>(null)
    var stripePaymentRequest = MutableStateFlow<StripePaymentRequest?>(null)
    var paypalApprovalRequest = MutableStateFlow<PayPalApprovalRequest?>(null)

    private var pendingStripePaymentIntentId: String? = null
    private var pendingPayPalOrderId: String? = null

    fun prefillFromCliente(cliente: Cliente) {
        nome.value = cliente.nome
        cognome.value = cliente.cognome
        email.value = cliente.email
        telefono.value = cliente.telefono ?: ""
        indirizzo.value = cliente.indirizzo ?: ""
        citta.value = cliente.citta ?: ""
        cap.value = cliente.cap ?: ""
        provincia.value = cliente.provincia ?: ""
        nazione.value = cliente.nazione ?: "Italia"
    }

    fun calcolaTotale(items: List<CartItem>, primoSconto: Boolean): Double {
        quote.value?.let { return it.total }
        val subtotal = items.sumOf { it.subtotal }
        val discount = if (primoSconto && scontoApplicato.value) subtotal * 0.10 else 0.0
        return subtotal - discount
    }

    fun applicaSconto(code: String, primoSconto: Boolean) {
        if (primoSconto && code.uppercase() == "BENVENUTO10") {
            scontoApplicato.value = true
        }
    }

    fun resetState() {
        _state.value = CheckoutState.Idle
    }

    fun refreshQuote(items: List<CartItem>) {
        val token = authRepo.currentAccessToken()
        if (token == null || items.isEmpty()) {
            quote.value = null
            return
        }
        viewModelScope.launch {
            runCatching { orderRepo.quote(items, shippingMethod.value, token) }
                .onSuccess {
                    quote.value = it
                    if (!it.productionPolicyRequired) productionPolicyAccepted.value = false
                }
                .onFailure { _state.value = CheckoutState.Error(it.message ?: "Quote failed") }
        }
    }

    fun submitOrder(items: List<CartItem>) {
        _state.value = CheckoutState.Loading
        viewModelScope.launch {
            val selectedPaymentMethod = metodoPagamento.value
            runCatching {
                val token = authRepo.currentAccessToken() ?: throw IllegalStateException("Login required")
                val currentQuote = quote.value ?: orderRepo.quote(items, shippingMethod.value, token).also { quote.value = it }
                if (currentQuote.productionPolicyRequired && !productionPolicyAccepted.value) {
                    throw IllegalStateException("Accetta la policy di produzione per procedere")
                }
                if (selectedPaymentMethod != "bonifico") {
                    throw IllegalStateException("Apri il provider di pagamento per completare l'ordine")
                }
                orderRepo.reserveBankTransfer(
                    items = items,
                    shippingMethod = shippingMethod.value,
                    accessToken = token,
                    productionPolicyAccepted = productionPolicyAccepted.value
                )
            }
                .onSuccess {
                lastConfirmedPaymentMethod.value = selectedPaymentMethod
                _state.value = CheckoutState.Success
            }
                .onFailure { _state.value = CheckoutState.Error(it.message ?: "Order failed") }
        }
    }

    fun startStripePayment(items: List<CartItem>) {
        if (BuildConfig.STRIPE_PK.isBlank()) {
            _state.value = CheckoutState.Error("Stripe non configurato")
            return
        }

        _state.value = CheckoutState.Loading
        viewModelScope.launch {
            runCatching {
                val token = authRepo.currentAccessToken() ?: throw IllegalStateException("Login required")
                val currentQuote = quote.value ?: orderRepo.quote(items, shippingMethod.value, token).also { quote.value = it }
                if (currentQuote.productionPolicyRequired && !productionPolicyAccepted.value) {
                    throw IllegalStateException("Accetta la policy di produzione per procedere")
                }
                orderRepo.createPaymentIntent(
                    items = items,
                    shippingMethod = shippingMethod.value,
                    accessToken = token,
                    productionPolicyAccepted = productionPolicyAccepted.value
                )
            }
                .onSuccess {
                    val paymentIntentId = it.paymentIntentId ?: it.clientSecret.substringBefore("_secret_")
                    pendingStripePaymentIntentId = paymentIntentId
                    stripePaymentRequest.value = StripePaymentRequest(
                        clientSecret = it.clientSecret,
                        paymentIntentId = paymentIntentId
                    )
                    _state.value = CheckoutState.Idle
                }
                .onFailure { _state.value = CheckoutState.Error(it.message ?: "Stripe payment failed") }
        }
    }

    fun clearStripePaymentRequest() {
        stripePaymentRequest.value = null
    }

    fun completeStripePayment(items: List<CartItem>) {
        val paymentIntentId = pendingStripePaymentIntentId
        if (paymentIntentId.isNullOrBlank()) {
            _state.value = CheckoutState.Error("Pagamento Stripe non verificabile")
            return
        }

        _state.value = CheckoutState.Loading
        viewModelScope.launch {
            runCatching {
                val token = authRepo.currentAccessToken() ?: throw IllegalStateException("Login required")
                orderRepo.finalizeCheckout(
                    items = items,
                    shippingMethod = shippingMethod.value,
                    paymentMethod = "Carta di Credito",
                    paymentStatus = "pagato",
                    accessToken = token,
                    productionPolicyAccepted = productionPolicyAccepted.value,
                    transactionId = paymentIntentId
                )
            }
                .onSuccess {
                    pendingStripePaymentIntentId = null
                    lastConfirmedPaymentMethod.value = "carta"
                    _state.value = CheckoutState.Success
                }
                .onFailure { _state.value = CheckoutState.Error(it.message ?: "Order failed") }
        }
    }

    fun startPayPalPayment(items: List<CartItem>) {
        if (BuildConfig.PAYPAL_ENABLED != "true") {
            _state.value = CheckoutState.Error("PayPal non configurato")
            return
        }

        _state.value = CheckoutState.Loading
        viewModelScope.launch {
            runCatching {
                val token = authRepo.currentAccessToken() ?: throw IllegalStateException("Login required")
                val currentQuote = quote.value ?: orderRepo.quote(items, shippingMethod.value, token).also { quote.value = it }
                if (currentQuote.productionPolicyRequired && !productionPolicyAccepted.value) {
                    throw IllegalStateException("Accetta la policy di produzione per procedere")
                }
                val siteBase = BuildConfig.SITE_URL.trim().trimEnd('/')
                orderRepo.createPayPalOrder(
                    items = items,
                    shippingMethod = shippingMethod.value,
                    accessToken = token,
                    productionPolicyAccepted = productionPolicyAccepted.value,
                    returnUrl = "$siteBase/paypal/android-return",
                    cancelUrl = "$siteBase/paypal/android-cancel"
                )
            }
                .onSuccess {
                    pendingPayPalOrderId = it.orderId
                    paypalApprovalRequest.value = PayPalApprovalRequest(
                        orderId = it.orderId,
                        approvalUrl = it.approvalUrl
                    )
                    _state.value = CheckoutState.Idle
                }
                .onFailure { _state.value = CheckoutState.Error(it.message ?: "PayPal payment failed") }
        }
    }

    fun markPayPalApprovalLaunched() {
        paypalApprovalRequest.value = null
    }

    fun completePayPalPayment(items: List<CartItem>, returnedOrderId: String?) {
        val orderId = returnedOrderId?.takeIf { it.isNotBlank() } ?: pendingPayPalOrderId
        if (orderId.isNullOrBlank()) {
            _state.value = CheckoutState.Error("Ordine PayPal non verificabile")
            return
        }

        _state.value = CheckoutState.Loading
        viewModelScope.launch {
            runCatching {
                val token = authRepo.currentAccessToken() ?: throw IllegalStateException("Login required")
                orderRepo.capturePayPalOrder(
                    items = items,
                    shippingMethod = shippingMethod.value,
                    orderId = orderId,
                    accessToken = token,
                    productionPolicyAccepted = productionPolicyAccepted.value
                )
            }
                .onSuccess {
                    pendingPayPalOrderId = null
                    lastConfirmedPaymentMethod.value = "paypal"
                    _state.value = CheckoutState.Success
                }
                .onFailure { _state.value = CheckoutState.Error(it.message ?: "PayPal capture failed") }
        }
    }

    fun cancelExternalPayment(message: String = "Pagamento annullato") {
        pendingPayPalOrderId = null
        pendingStripePaymentIntentId = null
        paypalApprovalRequest.value = null
        stripePaymentRequest.value = null
        _state.value = CheckoutState.Error(message)
    }
}
