package com.grgabriellaromeo.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import coil3.compose.AsyncImage
import com.grgabriellaromeo.app.data.SupabaseClient
import com.grgabriellaromeo.app.data.models.Evento
import com.grgabriellaromeo.app.ui.theme.Gold
import com.grgabriellaromeo.app.ui.theme.Michroma
import com.grgabriellaromeo.app.util.Translations
import io.github.jan.supabase.postgrest.from
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

private const val STORAGE_BASE = "https://mdpplumkmxjwyzunpjpg.supabase.co/storage/v1/object/public/"
private const val EVENT_STATUS_UPCOMING = "in_programmazione"
private const val EVENT_STATUS_DONE = "concluso"

class EventiViewModel : ViewModel() {
    private val _eventi = MutableStateFlow<List<Evento>>(emptyList())
    val eventi: StateFlow<List<Evento>> = _eventi
    private val _loading = MutableStateFlow(true)
    val loading: StateFlow<Boolean> = _loading

    init {
        viewModelScope.launch {
            runCatching {
                SupabaseClient.client.from("eventi").select().decodeList<Evento>()
            }.onSuccess {
                _eventi.value = it.sortedByDescending { evento -> evento.dataInizio ?: evento.createdAt ?: "" }
            }
            _loading.value = false
        }
    }
}

@Composable
fun EventiScreen(lang: String, vm: EventiViewModel = viewModel()) {
    val eventi by vm.eventi.collectAsState()
    val loading by vm.loading.collectAsState()

    Column(modifier = Modifier.fillMaxSize().background(Color.Black)) {
        Text(
            text = Translations.t("eventi", lang).uppercase(),
            color = Gold,
            fontFamily = Michroma,
            fontSize = 20.sp,
            letterSpacing = 2.sp,
            modifier = Modifier.padding(16.dp)
        )

        if (loading) {
            Box(Modifier.fillMaxSize(), Alignment.Center) { CircularProgressIndicator(color = Gold) }
        } else if (eventi.isEmpty()) {
            Box(Modifier.fillMaxSize(), Alignment.Center) {
                Text(Translations.t("nessun_risultato", lang), color = Color(0xFF888888))
            }
        } else {
            val inProgrammazione = eventi.filter { it.stato == EVENT_STATUS_UPCOMING }
            val conclusi = eventi.filter { it.stato == EVENT_STATUS_DONE }
            LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                if (inProgrammazione.isNotEmpty()) {
                    item { EventiSectionTitle("IN PROGRAMMAZIONE") }
                    items(inProgrammazione) { evento ->
                        EventoCard(evento = evento, lang = lang)
                    }
                }
                if (conclusi.isNotEmpty()) {
                    item { EventiSectionTitle("CONCLUSI") }
                    items(conclusi) { evento ->
                        EventoCard(evento = evento, lang = lang)
                    }
                }
            }
        }
    }
}

@Composable
private fun EventiSectionTitle(title: String) {
    Text(
        text = title,
        color = Gold,
        fontFamily = Michroma,
        fontSize = 13.sp,
        letterSpacing = 1.sp,
        modifier = Modifier.padding(top = 4.dp, bottom = 2.dp)
    )
}

@Composable
private fun EventoCard(evento: Evento, lang: String) {
    Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF111111))) {
        Column {
            evento.primaryImageUrl?.let { img ->
                AsyncImage(
                    model = eventAssetUrl(img),
                    contentDescription = null,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxWidth().height(200.dp)
                )
            }
            Column(modifier = Modifier.padding(16.dp)) {
                Text(text = evento.getTitolo(lang), color = Gold, fontFamily = Michroma, fontSize = 18.sp)
                eventDateLabel(evento)?.let {
                    Spacer(Modifier.height(4.dp))
                    Text(text = it, color = Color(0xFF888888), fontSize = 13.sp)
                }
                evento.getDescrizione(lang)?.let {
                    Spacer(Modifier.height(8.dp))
                    Text(text = it, color = Color(0xFFCCCCCC), fontSize = 14.sp, lineHeight = 20.sp)
                }
                if (evento.pdfUrls.isNotEmpty() || evento.videoUrls.isNotEmpty()) {
                    Spacer(Modifier.height(10.dp))
                    Text(
                        text = "PDF ${evento.pdfUrls.size}  VIDEO ${evento.videoUrls.size}",
                        color = Gold,
                        fontFamily = Michroma,
                        fontSize = 11.sp
                    )
                }
            }
        }
    }
}

private fun eventAssetUrl(url: String): String {
    return if (url.startsWith("http", ignoreCase = true)) url else "${STORAGE_BASE}eventi/$url"
}

private fun eventDateLabel(evento: Evento): String? {
    val start = evento.dataInizio?.take(10) ?: return null
    val end = evento.dataFine?.take(10)
    return if (!end.isNullOrBlank() && end != start) "$start - $end" else start
}
