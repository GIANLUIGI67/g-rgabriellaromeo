package com.grgabriellaromeo.app.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.grgabriellaromeo.app.data.models.Product
import com.grgabriellaromeo.app.data.repositories.ProductRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class ProductsState {
    object Loading : ProductsState()
    data class Success(val products: List<Product>) : ProductsState()
    data class Error(val message: String) : ProductsState()
}

class ProductListViewModel : ViewModel() {
    private val repo = ProductRepository()

    private val _state = MutableStateFlow<ProductsState>(ProductsState.Loading)
    val state: StateFlow<ProductsState> = _state

    fun load(categoria: String? = null) {
        _state.value = ProductsState.Loading
        viewModelScope.launch {
            runCatching {
                if (categoria != null) repo.getByCategory(categoria)
                else repo.getAll()
            }
                .onSuccess { _state.value = ProductsState.Success(it) }
                .onFailure {
                    Log.e("ProductListVM", "load error", it)
                    _state.value = ProductsState.Error(it.message ?: "Error")
                }
        }
    }

    fun loadOfferte() {
        _state.value = ProductsState.Loading
        viewModelScope.launch {
            runCatching { repo.getOfferte() }
                .onSuccess { _state.value = ProductsState.Success(it) }
                .onFailure {
                    Log.e("ProductListVM", "loadOfferte error", it)
                    _state.value = ProductsState.Error(it.message ?: "Error")
                }
        }
    }

    fun search(query: String) {
        _state.value = ProductsState.Loading
        viewModelScope.launch {
            runCatching { repo.search(query) }
                .onSuccess { _state.value = ProductsState.Success(it) }
                .onFailure {
                    Log.e("ProductListVM", "search error", it)
                    _state.value = ProductsState.Error(it.message ?: "Error")
                }
        }
    }
}
