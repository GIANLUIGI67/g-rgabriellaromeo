package com.grgabriellaromeo.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.AsyncImage
import com.grgabriellaromeo.app.data.models.CartItem
import com.grgabriellaromeo.app.data.models.Product
import com.grgabriellaromeo.app.ui.theme.Gold
import com.grgabriellaromeo.app.ui.theme.Michroma
import com.grgabriellaromeo.app.util.formatEuro
import com.grgabriellaromeo.app.util.Translations

private const val STORAGE_BASE = "https://mdpplumkmxjwyzunpjpg.supabase.co/storage/v1/object/public/immagini/"

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductDetailSheet(
    product: Product,
    lang: String,
    onDismiss: () -> Unit,
    onAddToCart: (CartItem) -> Unit
) {
    val images = product.getImmaginiList()
    val taglie = product.getTaglieList()
    val colori = product.getColoriList()

    var selectedImage by remember { mutableIntStateOf(0) }
    var selectedTaglia by remember { mutableStateOf(taglie.firstOrNull()) }
    var selectedColore by remember { mutableStateOf(colori.firstOrNull()) }
    var quantity by remember { mutableIntStateOf(1) }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = Color(0xFF111111),
        contentColor = Color.White
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .padding(bottom = 32.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = product.getName(lang),
                    fontFamily = Michroma,
                    fontSize = 18.sp,
                    color = Color.White,
                    modifier = Modifier.weight(1f)
                )
                IconButton(onClick = onDismiss) {
                    Icon(Icons.Default.Close, contentDescription = null, tint = Color.White)
                }
            }

            Box(modifier = Modifier.fillMaxWidth().aspectRatio(1f)) {
                AsyncImage(
                    model = images.getOrNull(selectedImage)?.let { "$STORAGE_BASE$it" },
                    contentDescription = null,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
            }

            if (images.size > 1) {
                Row(
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    images.forEachIndexed { idx, img ->
                        AsyncImage(
                            model = "$STORAGE_BASE$img",
                            contentDescription = null,
                            contentScale = ContentScale.Crop,
                            modifier = Modifier
                                .size(56.dp)
                                .border(
                                    width = if (idx == selectedImage) 2.dp else 0.dp,
                                    color = if (idx == selectedImage) Gold else Color.Transparent
                                )
                                .clickable { selectedImage = idx }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (product.hasDiscount) {
                    Text(
                        text = formatEuro(product.prezzo),
                        color = Color(0xFF888888),
                        fontSize = 14.sp,
                        fontFamily = FontFamily.SansSerif,
                        textDecoration = TextDecoration.LineThrough
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                }
                Text(
                    text = formatEuro(product.prezzoEffettivo),
                    color = Gold,
                    fontSize = 20.sp,
                    fontFamily = FontFamily.SansSerif
                )
                if (product.sconto != null && product.sconto > 0) {
                    Text(
                        text = "(-${product.sconto.toInt()}%)",
                        color = Color(0xFFCC0000),
                        fontSize = 13.sp
                    )
                }
            }

            product.getDescrizione(lang)?.let { desc ->
                Text(
                    text = desc,
                    color = Color(0xFFCCCCCC),
                    fontSize = 14.sp,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                    lineHeight = 20.sp
                )
            }

            if (taglie.isNotEmpty()) {
                Text(
                    text = Translations.t("taglia", lang),
                    color = Color(0xFF888888),
                    fontSize = 12.sp,
                    letterSpacing = 1.sp,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
                )
                Row(
                    modifier = Modifier.padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    taglie.forEach { t ->
                        val selected = t == selectedTaglia
                        Box(
                            modifier = Modifier
                                .border(1.dp, if (selected) Gold else Color(0xFF444444))
                                .background(if (selected) Gold.copy(alpha = 0.15f) else Color.Transparent)
                                .clickable { selectedTaglia = t }
                                .padding(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Text(text = t, color = if (selected) Gold else Color.White, fontSize = 13.sp)
                        }
                    }
                }
            }

            if (colori.isNotEmpty()) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = Translations.t("colore", lang),
                    color = Color(0xFF888888),
                    fontSize = 12.sp,
                    letterSpacing = 1.sp,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
                )
                Row(
                    modifier = Modifier.padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    colori.forEach { c ->
                        val selected = c == selectedColore
                        Box(
                            modifier = Modifier
                                .border(1.dp, if (selected) Gold else Color(0xFF444444))
                                .background(if (selected) Gold.copy(alpha = 0.15f) else Color.Transparent)
                                .clickable { selectedColore = c }
                                .padding(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Text(text = c, color = if (selected) Gold else Color.White, fontSize = 13.sp)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.padding(horizontal = 16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(
                    text = Translations.t("quantita", lang),
                    color = Color(0xFF888888),
                    fontSize = 12.sp
                )
                IconButton(onClick = { if (quantity > 1) quantity-- }) {
                    Text(text = "−", color = Color.White, fontSize = 18.sp)
                }
                Text(text = quantity.toString(), color = Color.White)
                IconButton(onClick = { quantity++ }) {
                    Text(text = "+", color = Color.White, fontSize = 18.sp)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Button(
                onClick = {
                    onAddToCart(
                        CartItem(
                            productId = product.id,
                            name = product.getName(lang),
                            price = product.prezzoEffettivo,
                            imageUrl = product.immagine,
                            quantity = quantity,
                            taglia = selectedTaglia,
                            colore = selectedColore,
                            availableQuantity = product.quantita,
                            madeToOrder = product.madeToOrder == true,
                            allowBackorder = product.allowBackorder == true,
                            disponibile = product.disponibile,
                            offerta = product.offerta,
                            sconto = product.sconto ?: 0.0
                        )
                    )
                    onDismiss()
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .height(50.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Gold, contentColor = Color.Black),
                enabled = product.isAvailable
            ) {
                Text(
                    text = if (product.isAvailable)
                        Translations.t("aggiungi_carrello", lang)
                    else
                        Translations.t("esaurito", lang),
                    letterSpacing = 1.sp
                )
            }
        }
    }
}
