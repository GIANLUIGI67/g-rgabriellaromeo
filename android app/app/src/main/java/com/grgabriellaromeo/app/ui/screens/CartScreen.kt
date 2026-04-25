package com.grgabriellaromeo.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.AsyncImage
import com.grgabriellaromeo.app.ui.theme.Gold
import com.grgabriellaromeo.app.ui.theme.Michroma
import com.grgabriellaromeo.app.util.formatEuro
import com.grgabriellaromeo.app.util.Translations
import com.grgabriellaromeo.app.viewmodel.CartViewModel

private const val STORAGE_BASE = "https://mdpplumkmxjwyzunpjpg.supabase.co/storage/v1/object/public/"

@Composable
fun CartScreen(
    cartVm: CartViewModel,
    lang: String,
    onCheckout: () -> Unit
) {
    val items by cartVm.items.collectAsState()

    Column(modifier = Modifier.fillMaxSize().background(Color.Black)) {
        Text(
            text = Translations.t("carrello", lang).uppercase(),
            color = Gold,
            fontFamily = Michroma,
            fontSize = 20.sp,
            letterSpacing = 2.sp,
            modifier = Modifier.padding(16.dp)
        )

        if (items.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(text = Translations.t("nessun_prodotto", lang), color = Color(0xFF888888))
            }
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f),
                contentPadding = PaddingValues(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(items) { item ->
                    Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF111111))) {
                        Row(
                            modifier = Modifier.padding(10.dp),
                            horizontalArrangement = Arrangement.spacedBy(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            item.imageUrl?.let { img ->
                                AsyncImage(
                                    model = "$STORAGE_BASE$img",
                                    contentDescription = null,
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier.size(72.dp)
                                )
                            }
                            Column(modifier = Modifier.weight(1f)) {
                                Text(text = item.name, color = Color.White, fontSize = 14.sp)
                                item.taglia?.let { Text(text = "${Translations.t("taglia", lang)}: $it", color = Color(0xFF888888), fontSize = 12.sp) }
                                item.colore?.let { Text(text = "${Translations.t("colore", lang)}: $it", color = Color(0xFF888888), fontSize = 12.sp) }
                                Text(text = formatEuro(item.price), color = Gold, fontSize = 13.sp, fontFamily = FontFamily.SansSerif)

                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    IconButton(onClick = { cartVm.updateQuantity(item.productId, item.taglia, item.colore, item.quantity - 1) }, modifier = Modifier.size(28.dp)) {
                                        Text("−", color = Color.White)
                                    }
                                    Text(text = item.quantity.toString(), color = Color.White)
                                    IconButton(onClick = { cartVm.updateQuantity(item.productId, item.taglia, item.colore, item.quantity + 1) }, modifier = Modifier.size(28.dp)) {
                                        Text("+", color = Color.White)
                                    }
                                }
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                Text(text = formatEuro(item.subtotal), color = Gold, fontSize = 14.sp, fontFamily = FontFamily.SansSerif)
                                IconButton(onClick = { cartVm.removeItem(item.productId, item.taglia, item.colore) }) {
                                    Icon(Icons.Default.Delete, contentDescription = null, tint = Color(0xFF888888), modifier = Modifier.size(20.dp))
                                }
                            }
                        }
                    }
                }
            }

            HorizontalDivider(color = Color(0xFF222222))
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(text = Translations.t("spedizione", lang), color = Color(0xFF888888))
                    Text(text = Translations.t("gratuita", lang), color = Color(0xFF888888))
                }
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(text = Translations.t("totale", lang), color = Color.White, fontSize = 16.sp)
                    Text(text = formatEuro(cartVm.total), color = Gold, fontSize = 16.sp, fontFamily = FontFamily.SansSerif)
                }
                Spacer(Modifier.height(4.dp))
                Button(
                    onClick = onCheckout,
                    modifier = Modifier.fillMaxWidth().height(50.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Gold, contentColor = Color.Black)
                ) {
                    Text(text = Translations.t("checkout", lang), letterSpacing = 1.sp)
                }
                TextButton(onClick = { cartVm.clear() }, modifier = Modifier.fillMaxWidth()) {
                    Text(text = Translations.t("svuota_carrello", lang), color = Color(0xFF888888), fontSize = 12.sp)
                }
            }
        }
    }
}
