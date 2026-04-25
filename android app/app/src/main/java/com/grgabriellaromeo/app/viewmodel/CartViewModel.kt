package com.grgabriellaromeo.app.viewmodel

import android.app.Application
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import android.content.Context
import com.grgabriellaromeo.app.data.models.CartItem
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.serialization.json.Json
import kotlinx.serialization.encodeToString
import kotlinx.serialization.decodeFromString

private val Context.cartDataStore by preferencesDataStore(name = "cart")
private val CART_KEY = stringPreferencesKey("cart_items")

class CartViewModel(app: Application) : AndroidViewModel(app) {
    private val _items = MutableStateFlow<List<CartItem>>(emptyList())
    val items: StateFlow<List<CartItem>> = _items

    val total: Double get() = _items.value.sumOf { it.subtotal }
    val count: Int get() = _items.value.sumOf { it.quantity }

    init {
        viewModelScope.launch {
            val prefs = getApplication<Application>().cartDataStore.data.first()
            val json = prefs[CART_KEY] ?: "[]"
            runCatching {
                _items.value = Json.decodeFromString(json)
            }
        }
    }

    fun addItem(item: CartItem) {
        val current = _items.value.toMutableList()
        val idx = current.indexOfFirst {
            it.productId == item.productId &&
            it.taglia == item.taglia &&
            it.colore == item.colore
        }
        if (idx >= 0) {
            current[idx] = current[idx].copy(quantity = current[idx].quantity + item.quantity)
        } else {
            current.add(item)
        }
        _items.value = current
        persist()
    }

    fun removeItem(productId: String, taglia: String?, colore: String?) {
        _items.value = _items.value.filter {
            !(it.productId == productId && it.taglia == taglia && it.colore == colore)
        }
        persist()
    }

    fun updateQuantity(productId: String, taglia: String?, colore: String?, qty: Int) {
        if (qty <= 0) { removeItem(productId, taglia, colore); return }
        _items.value = _items.value.map {
            if (it.productId == productId && it.taglia == taglia && it.colore == colore)
                it.copy(quantity = qty)
            else it
        }
        persist()
    }

    fun clear() {
        _items.value = emptyList()
        persist()
    }

    private fun persist() {
        viewModelScope.launch {
            val json = Json.encodeToString(_items.value)
            getApplication<Application>().cartDataStore.edit { it[CART_KEY] = json }
        }
    }
}
