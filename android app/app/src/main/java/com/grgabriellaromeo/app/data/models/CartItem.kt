package com.grgabriellaromeo.app.data.models

import kotlinx.serialization.Serializable

@Serializable
data class CartItem(
    val productId: String,
    val name: String,
    val price: Double,
    val imageUrl: String?,
    val quantity: Int = 1,
    val taglia: String? = null,
    val colore: String? = null,
    val availableQuantity: Int? = null,
    val madeToOrder: Boolean = false,
    val allowBackorder: Boolean = false,
    val disponibile: Boolean = true,
    val offerta: Boolean = false,
    val sconto: Double = 0.0
) {
    val subtotal: Double get() = price * quantity
    val productionRequired: Boolean get() = quantity > (availableQuantity ?: 0)
}
