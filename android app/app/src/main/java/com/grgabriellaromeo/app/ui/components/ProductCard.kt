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
import com.grgabriellaromeo.app.ui.theme.Gold
import com.grgabriellaromeo.app.ui.theme.Michroma
import com.grgabriellaromeo.app.util.formatEuro
import com.grgabriellaromeo.app.util.Translations

private const val STORAGE_BASE = "https://mdpplumkmxjwyzunpjpg.supabase.co/storage/v1/object/public/immagini/"

@Composable
fun ProductCard(product: Product, lang: String, onClick: () -> Unit) {
    val imageUrl = product.immagine?.let { imageUrlFor(it) }
    val name = product.getName(lang)
    val isSoldOut = product.isSoldOut

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .widthIn(max = 326.dp)
            .background(Color.Black)
            .clickable(enabled = !isSoldOut) { onClick() }
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(222.dp)
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
                        fontFamily = Michroma,
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

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 9.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.Top
        ) {
            Column(
                modifier = Modifier
                    .weight(1f)
                    .padding(end = 10.dp)
            ) {
                Text(
                    text = name,
                    color = Gold,
                    fontFamily = Michroma,
                    fontSize = 17.sp,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    lineHeight = 23.sp
                )
                if (!product.sottocategoria.isNullOrBlank()) {
                    Text(
                        text = product.sottocategoria,
                        color = Gold.copy(alpha = 0.62f),
                        fontFamily = Michroma,
                        fontSize = 12.sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
                product.getDescrizione(lang)?.takeIf { it.isNotBlank() }?.let { desc ->
                    Text(
                        text = desc,
                        color = Gold.copy(alpha = 0.58f),
                        fontFamily = Michroma,
                        fontSize = 11.sp,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis,
                        lineHeight = 16.sp
                    )
                }
            }

            Column(horizontalAlignment = Alignment.End) {
                if (!product.hasDisplayPrice) {
                    Text(
                        text = Translations.t("prezzo_su_richiesta", lang),
                        color = Color(0xFF2B61F5),
                        fontFamily = FontFamily.SansSerif,
                        fontSize = 13.sp,
                        lineHeight = 16.sp,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                } else {
                    if (product.hasDiscount) {
                        Text(
                            text = formatEuro(product.prezzo),
                            color = Gold.copy(alpha = 0.45f),
                            fontFamily = FontFamily.SansSerif,
                            fontSize = 13.sp,
                            textDecoration = TextDecoration.LineThrough,
                            maxLines = 1
                        )
                    }
                    Text(
                        text = formatEuro(product.prezzoEffettivo),
                        color = Gold,
                        fontFamily = FontFamily.SansSerif,
                        fontSize = 16.sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }
        }
    }
}

private fun imageUrlFor(value: String): String =
    when {
        value.startsWith("http", ignoreCase = true) -> value
        value.startsWith("old-gallery/") -> "file:///android_asset/product-images/$value"
        else -> "$STORAGE_BASE$value"
    }
