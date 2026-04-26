package com.grgabriellaromeo.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.grgabriellaromeo.app.ui.theme.Gold
import com.grgabriellaromeo.app.ui.theme.Michroma
import com.grgabriellaromeo.app.util.Translations

private data class Servizio(val icon: String, val titleKey: String, val descIt: String, val descEn: String)

private val servizi = listOf(
    Servizio("💍", "gioielli", "Creazione e riparazione di gioielli artigianali su misura con materiali pregiati.", "Creation and repair of custom handcrafted jewellery with precious materials."),
    Servizio("✂️", "abbigliamento", "Confezione e alterazione di abiti su misura con tessuti italiani di alta qualità.", "Tailoring and alteration of custom clothing using premium Italian fabrics."),
    Servizio("📦", "spedizione", "Spedizione in tutto il mondo con packaging di lusso e assicurazione.", "Worldwide shipping with luxury packaging and insurance."),
    Servizio("🔧", "riparazioni", "Servizio di riparazione e restauro di gioielli e accessori di lusso.", "Repair and restoration service for luxury jewellery and accessories."),
    Servizio("🎁", "regalo", "Servizio di confezioni regalo personalizzate per ogni occasione speciale.", "Personalized gift wrapping service for every special occasion.")
)

private val serviziContactLinks = listOf(
    "Email" to "mailto:info@g-rgabriellaromeo.it",
    "WhatsApp" to "https://wa.me/393429506938",
    "Instagram" to "https://www.instagram.com/grgabriellaromeo/",
    "Facebook" to "https://www.facebook.com/GRGabriellaRomeoItalianStyle"
)

@Composable
fun ServiziScreen(lang: String) {
    val uriHandler = LocalUriHandler.current

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
            .verticalScroll(rememberScrollState())
    ) {
        Text(
            text = Translations.t("servizi", lang).uppercase(),
            color = Gold,
            fontFamily = Michroma,
            fontSize = 20.sp,
            letterSpacing = 2.sp,
            modifier = Modifier.padding(16.dp)
        )

        Column(
            modifier = Modifier.padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            servizi.forEach { servizio ->
                Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF111111))) {
                    Row(modifier = Modifier.padding(16.dp)) {
                        Text(text = servizio.icon, fontSize = 28.sp)
                        Spacer(Modifier.width(12.dp))
                        Column {
                            Text(
                                text = Translations.t(servizio.titleKey, lang).uppercase(),
                                color = Gold,
                                fontSize = 13.sp,
                                letterSpacing = 1.sp
                            )
                            Spacer(Modifier.height(6.dp))
                            Text(
                                text = if (lang == "en") servizio.descEn else servizio.descIt,
                                color = Color(0xFFCCCCCC),
                                fontSize = 14.sp,
                                lineHeight = 20.sp
                            )
                        }
                    }
                }
            }
        }

        Spacer(Modifier.height(32.dp))

        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = Translations.t("contattaci", lang), color = Gold, fontSize = 16.sp)
            Spacer(Modifier.height(8.dp))
            serviziContactLinks.forEach { (label, uri) ->
                Text(
                    text = label,
                    color = Color(0xFFCCCCCC),
                    fontSize = 14.sp,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { uriHandler.openUri(uri) }
                        .padding(vertical = 3.dp)
                )
            }
        }

        Spacer(Modifier.height(48.dp))
    }
}
