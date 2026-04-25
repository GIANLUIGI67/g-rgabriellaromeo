package com.grgabriellaromeo.app.data.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Product(
    val id: String = "",
    val nome: String = "",
    @SerialName("nome_en") val nomeEn: String? = null,
    @SerialName("nome_fr") val nomeFr: String? = null,
    @SerialName("nome_de") val nomeDe: String? = null,
    @SerialName("nome_es") val nomeEs: String? = null,
    @SerialName("nome_ar") val nomeAr: String? = null,
    @SerialName("nome_zh") val nomeZh: String? = null,
    @SerialName("nome_ja") val nomeJa: String? = null,
    val descrizione: String? = null,
    @SerialName("descrizione_en") val descrizioneEn: String? = null,
    @SerialName("descrizione_fr") val descrizioneFr: String? = null,
    @SerialName("descrizione_de") val descrizioneDe: String? = null,
    @SerialName("descrizione_es") val descrizioneEs: String? = null,
    @SerialName("descrizione_ar") val descrizioneAr: String? = null,
    @SerialName("descrizione_zh") val descrizioneZh: String? = null,
    @SerialName("descrizione_ja") val descrizioneJa: String? = null,
    val prezzo: Double = 0.0,
    @SerialName("prezzo_scontato") val prezzoScontato: Double? = null,
    val categoria: String = "",
    val sottocategoria: String? = null,
    val immagine: String? = null,
    val immagini: String? = null,
    val taglie: String? = null,
    val colori: String? = null,
    val disponibile: Boolean = true,
    val offerta: Boolean = false,
    val sconto: Double? = null,
    val quantita: Int? = null,
    @SerialName("made_to_order") val madeToOrder: Boolean? = null,
    @SerialName("allow_backorder") val allowBackorder: Boolean? = null,
    @SerialName("created_at") val createdAt: String? = null
) {
    fun getName(lang: String): String = when (lang) {
        "en" -> nomeEn ?: nome
        "fr" -> nomeFr ?: nome
        "de" -> nomeDe ?: nome
        "es" -> nomeEs ?: nome
        "ar" -> nomeAr ?: nome
        "zh" -> nomeZh ?: nome
        "ja" -> nomeJa ?: nome
        else -> nome
    }

    fun getDescrizione(lang: String): String? = when (lang) {
        "en" -> descrizioneEn ?: descrizione
        "fr" -> descrizioneFr ?: descrizione
        "de" -> descrizioneDe ?: descrizione
        "es" -> descrizioneEs ?: descrizione
        "ar" -> descrizioneAr ?: descrizione
        "zh" -> descrizioneZh ?: descrizione
        "ja" -> descrizioneJa ?: descrizione
        else -> descrizione
    }

    fun getImmaginiList(): List<String> {
        val list = mutableListOf<String>()
        if (!immagine.isNullOrBlank()) list.add(immagine)
        if (!immagini.isNullOrBlank()) {
            immagini.split(",").map { it.trim() }.filter { it.isNotBlank() }.forEach {
                if (it != immagine) list.add(it)
            }
        }
        return list.distinct()
    }

    fun getTaglieList(): List<String> =
        taglie?.split(",")?.map { it.trim() }?.filter { it.isNotBlank() } ?: emptyList()

    fun getColoriList(): List<String> =
        colori?.split(",")?.map { it.trim() }?.filter { it.isNotBlank() } ?: emptyList()

    val prezzoEffettivo: Double get() = when {
        prezzoScontato != null -> prezzoScontato
        sconto != null && sconto > 0 -> prezzo * (1.0 - sconto / 100.0)
        else -> prezzo
    }
    val hasDiscount: Boolean get() = prezzoScontato != null || (sconto != null && sconto > 0)
    val isAvailable: Boolean get() = disponibile
    fun requiresProduction(quantity: Int): Boolean = quantity > (quantita ?: 0)
}
