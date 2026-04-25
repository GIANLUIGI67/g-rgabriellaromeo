package com.grgabriellaromeo.app.data.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Cliente(
    val id: String = "",
    @SerialName("user_id") val userId: String? = null,
    val email: String = "",
    val nome: String = "",
    val cognome: String = "",
    @SerialName("telefono1") val telefono1: String? = null,
    @SerialName("telefono2") val telefono2: String? = null,
    val indirizzo: String? = null,
    val citta: String? = null,
    @SerialName("codice_postale") val codicePostale: String? = null,
    val provincia: String? = null,
    val paese: String? = null,
    @SerialName("primo_sconto") val primoScontoPercent: Double? = null,
    @SerialName("created_at") val createdAt: String? = null
) {
    val telefono: String?
        get() = telefono1

    val cap: String?
        get() = codicePostale

    val nazione: String?
        get() = paese

    val primoSconto: Boolean
        get() = (primoScontoPercent ?: 0.0) > 0.0
}
