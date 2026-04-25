package com.grgabriellaromeo.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.AsyncImage
import com.grgabriellaromeo.app.ui.theme.Gold
import com.grgabriellaromeo.app.ui.theme.Michroma
import com.grgabriellaromeo.app.util.Translations

private const val BRAND_IMG = "https://mdpplumkmxjwyzunpjpg.supabase.co/storage/v1/object/public/immagini/brand.jpg"

@Composable
fun BrandScreen(lang: String) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
            .verticalScroll(rememberScrollState())
    ) {
        Box(
            modifier = Modifier.fillMaxWidth().height(300.dp),
            contentAlignment = Alignment.BottomCenter
        ) {
            AsyncImage(
                model = BRAND_IMG,
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
            )
            Box(Modifier.matchParentSize().background(Color.Black.copy(alpha = 0.5f)))
            Text(
                text = Translations.t("brand", lang).uppercase(),
                color = Gold,
                fontFamily = Michroma,
                fontSize = 24.sp,
                letterSpacing = 3.sp,
                modifier = Modifier.padding(bottom = 24.dp)
            )
        }

        Column(modifier = Modifier.padding(24.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
            Text(
                text = "La Storia",
                color = Gold,
                fontFamily = Michroma,
                fontSize = 20.sp
            )
            Text(
                text = "G-R Gabriella Romeo è un marchio italiano di alta moda e gioielleria fondato nel 1990. Con oltre trent'anni di tradizione artigianale, il brand incarna l'eccellenza del made in Italy, combinando l'arte orafa italiana con un design contemporaneo raffinato.",
                color = Color(0xFFCCCCCC),
                fontSize = 14.sp,
                lineHeight = 22.sp
            )
            Text(
                text = "La Filosofia",
                color = Gold,
                fontFamily = Michroma,
                fontSize = 20.sp
            )
            Text(
                text = "Ogni creazione nasce da un attento studio dei materiali e delle forme. Utilizziamo solo metalli preziosi certificati, pietre naturali selezionate e tessuti italiani di prima qualità. Il nostro processo produttivo artigianale garantisce pezzi unici, dove ogni dettaglio racconta una storia di passione e maestria.",
                color = Color(0xFFCCCCCC),
                fontSize = 14.sp,
                lineHeight = 22.sp
            )
            Text(
                text = "Sostenibilità",
                color = Gold,
                fontFamily = Michroma,
                fontSize = 20.sp
            )
            Text(
                text = "Siamo impegnati in un percorso di sostenibilità responsabile: utilizziamo materiali eticamente approvvigionati, packaging riciclabile e processi produttivi a basso impatto ambientale.",
                color = Color(0xFFCCCCCC),
                fontSize = 14.sp,
                lineHeight = 22.sp
            )

            Spacer(Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                BrandStat(value = "30+", label = "Anni")
                BrandStat(value = "500+", label = "Creazioni")
                BrandStat(value = "50+", label = "Paesi")
            }
        }

        Spacer(Modifier.height(48.dp))
    }
}

@Composable
private fun BrandStat(value: String, label: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(text = value, color = Gold, fontFamily = Michroma, fontSize = 28.sp)
        Text(text = label, color = Color(0xFF888888), fontSize = 12.sp, letterSpacing = 1.sp)
    }
}
