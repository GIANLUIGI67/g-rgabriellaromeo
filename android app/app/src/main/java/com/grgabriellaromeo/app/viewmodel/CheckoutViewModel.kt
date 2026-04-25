package com.grgabriellaromeo.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
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
            runCatching {
                val token = authRepo.currentAccessToken() ?: throw IllegalStateException("Login required")
                val currentQuote = quote.value ?: orderRepo.quote(items, shippingMethod.value, token).also { quote.value = it }
                if (currentQuote.productionPolicyRequired && !productionPolicyAccepted.value) {
                    throw IllegalStateException("Accetta la policy di produzione per procedere")
                }
                orderRepo.finalizeCheckout(
                    items = items,
                    shippingMethod = shippingMethod.value,
                    paymentMethod = metodoPagamento.value,
                    paymentStatus = if (metodoPagamento.value == "bonifico") "in attesa bonifico" else "in attesa pagamento",
                    accessToken = token,
                    productionPolicyAccepted = productionPolicyAccepted.value
                )
            }
                .onSuccess { _state.value = CheckoutState.Success }
                .onFailure { _state.value = CheckoutState.Error(it.message ?: "Order failed") }
        }
    }
}
