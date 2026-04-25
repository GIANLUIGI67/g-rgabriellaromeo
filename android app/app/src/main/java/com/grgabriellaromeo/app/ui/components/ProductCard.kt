package com.grgabriellaromeo.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.AsyncImage
import com.grgabriellaromeo.app.data.models.Product
import com.grgabriellaromeo.app.util.formatEuro
import com.grgabriellaromeo.app.util.Translations

private const val STORAGE_BASE = "https://mdpplumkmxjwyzunpjpg.supabase.co/storage/v1/object/public/immagini/"

@Composable
fun ProductCard(product: Product, lang: String, onClick: () -> Unit) {
    val imageUrl = product.immagine?.let { "$STORAGE_BASE$it" }
    val name = product.getName(lang)
    val isSoldOut = !product.disponibile

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(300.dp)
            .background(Color.White)
            .clickable(enabled = !isSoldOut) { onClick() }
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(190.dp)
            ) {
                AsyncImage(
                    model = imageUrl,
                    contentDescription = name,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
                if (isSoldOut) {
                    Box(
                        modifier = Modifier
                            .matchParentSize()
                            .background(Color.Black.copy(alpha = 0.55f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = Translations.t("esaurito", lang).uppercase(),
                            color = Color.White,
                            fontSize = 13.sp,
                            letterSpacing = 2.sp
                        )
                    }
                }
                if (product.offerta) {
                    Box(
                        modifier = Modifier
                            .align(Alignment.TopStart)
                            .background(Color(0xFFCC0000))
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(text = "SALE", color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 8.dp, vertical = 6.dp)
            ) {
                Text(
                    text = name,
                    color = Color.Black,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    lineHeight = 17.sp
                )
                if (!product.sottocategoria.isNullOrBlank()) {
                    Text(
                        text = product.sottocategoria,
                        color = Color(0xFF555555),
                        fontSize = 11.sp
                    )
                }
                Spacer(modifier = Modifier.height(4.dp))
                if (product.hasDiscount) {
                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp), verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = formatEuro(product.prezzo),
                            color = Color(0xFF888888),
                            fontSize = 11.sp,
                            fontFamily = FontFamily.SansSerif,
                            textDecoration = TextDecoration.LineThrough
                        )
                        Text(
                            text = formatEuro(product.prezzoEffettivo),
                            color = Color(0xFFCC0000),
                            fontSize = 13.sp,
                            fontFamily = FontFamily.SansSerif,
                            fontWeight = FontWeight.Bold
                        )
                        if (product.sconto != null && product.sconto > 0) {
                            Text(
                                text = "(-${product.sconto.toInt()}%)",
                                color = Color(0xFFCC0000),
                                fontSize = 10.sp
                            )
                        }
                    }
                } else {
                    Text(
                        text = formatEuro(product.prezzo),
                        color = Color.Black,
                        fontSize = 13.sp,
                        fontFamily = FontFamily.SansSerif
                    )
                }
            }
        }
    }
}
