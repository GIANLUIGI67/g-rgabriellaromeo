package com.grgabriellaromeo.app.data.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Evento(
    val id: Int = 0,
    val titolo: String = "",
    @SerialName("titolo_en") val titoloEn: String? = null,
    @SerialName("titolo_fr") val titoloFr: String? = null,
    @SerialName("titolo_de") val titoloDe: String? = null,
    @SerialName("titolo_es") val titoloEs: String? = null,
    @SerialName("titolo_ar") val titoloAr: String? = null,
    @SerialName("titolo_zh") val titoloZh: String? = null,
    @SerialName("titolo_ja") val titoloJa: String? = null,
    val descrizione: String? = null,
    @SerialName("descrizione_en") val descrizioneEn: String? = null,
    @SerialName("descrizione_fr") val descrizioneFr: String? = null,
    @SerialName("descrizione_de") val descrizioneDe: String? = null,
    @SerialName("descrizione_es") val descrizioneEs: String? = null,
    @SerialName("descrizione_ar") val descrizioneAr: String? = null,
    @SerialName("descrizione_zh") val descrizioneZh: String? = null,
    @SerialName("descrizione_ja") val descrizioneJa: String? = null,
    @SerialName("data_inizio") val dataInizio: String? = null,
    @SerialName("data_fine") val dataFine: String? = null,
    val stato: String = "in_programmazione",
    @SerialName("pdf_urls") val pdfUrls: List<String> = emptyList(),
    @SerialName("video_urls") val videoUrls: List<String> = emptyList(),
    @SerialName("foto_urls") val fotoUrls: List<String> = emptyList(),
    @SerialName("created_at") val createdAt: String? = null
) {
    val isInProgrammazione: Boolean
        get() = stato == "in_programmazione"

    val primaryImageUrl: String?
        get() = fotoUrls.firstOrNull()

    fun getTitolo(lang: String): String = when (lang) {
        "en" -> titoloEn ?: titolo
        "fr" -> titoloFr ?: titolo
        "de" -> titoloDe ?: titolo
        "es" -> titoloEs ?: titolo
        "ar" -> titoloAr ?: titolo
        "zh" -> titoloZh ?: titolo
        "ja" -> titoloJa ?: titolo
        else -> titolo
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
}
