package com.grgabriellaromeo.app.data.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Cliente(
    val id: String = "",
    val email: String = "",
    val nome: String = "",
    val cognome: String = "",
    val telefono: String? = null,
    val indirizzo: String? = null,
    val citta: String? = null,
    val cap: String? = null,
    val provincia: String? = null,
    val nazione: String? = null,
    @SerialName("primo_sconto") val primoSconto: Boolean = false,
    @SerialName("created_at") val createdAt: String? = null
)
