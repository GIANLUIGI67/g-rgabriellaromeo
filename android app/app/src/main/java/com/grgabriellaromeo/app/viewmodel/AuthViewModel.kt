package com.grgabriellaromeo.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.grgabriellaromeo.app.data.models.Cliente
import com.grgabriellaromeo.app.data.repositories.AuthRepository
import io.github.jan.supabase.auth.user.UserInfo
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class AuthState {
    object Idle : AuthState()
    object Loading : AuthState()
    data class Success(val user: UserInfo) : AuthState()
    data class Error(val message: String) : AuthState()
}

class AuthViewModel : ViewModel() {
    private val repo = AuthRepository()

    private val _state = MutableStateFlow<AuthState>(AuthState.Idle)
    val state: StateFlow<AuthState> = _state

    private val _cliente = MutableStateFlow<Cliente?>(null)
    val cliente: StateFlow<Cliente?> = _cliente

    init {
        checkCurrentUser()
    }

    private fun checkCurrentUser() {
        val user = repo.currentUser()
        if (user != null) {
            _state.value = AuthState.Success(user)
            loadCliente(user.id)
        }
    }

    fun login(email: String, password: String) {
        _state.value = AuthState.Loading
        viewModelScope.launch {
            runCatching { repo.login(email, password) }
                .onSuccess {
                    val user = repo.currentUser()!!
                    _state.value = AuthState.Success(user)
                    loadCliente(user.id)
                }
                .onFailure { _state.value = AuthState.Error(it.message ?: "Login failed") }
        }
    }

    fun register(email: String, password: String, nome: String, cognome: String, telefono: String) {
        _state.value = AuthState.Loading
        viewModelScope.launch {
            runCatching { repo.register(email, password, nome, cognome, telefono) }
                .onSuccess {
                    val user = repo.currentUser()!!
                    _state.value = AuthState.Success(user)
                    loadCliente(user.id)
                }
                .onFailure { _state.value = AuthState.Error(it.message ?: "Registration failed") }
        }
    }

    fun logout() {
        viewModelScope.launch {
            runCatching { repo.logout() }
            _state.value = AuthState.Idle
            _cliente.value = null
        }
    }

    private fun loadCliente(userId: String) {
        viewModelScope.launch {
            runCatching { repo.getCliente(userId) }
                .onSuccess { _cliente.value = it }
        }
    }

    fun updateCliente(cliente: Cliente) {
        viewModelScope.launch {
            runCatching { repo.updateCliente(cliente) }
                .onSuccess { _cliente.value = cliente }
        }
    }

    fun isLoggedIn(): Boolean = _state.value is AuthState.Success

    fun currentUserId(): String? = (_state.value as? AuthState.Success)?.user?.id
}
