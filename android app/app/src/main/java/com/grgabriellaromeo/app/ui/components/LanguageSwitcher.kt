package com.grgabriellaromeo.app.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val languages = listOf(
    "it" to "🇮🇹",
    "en" to "🇬🇧",
    "fr" to "🇫🇷",
    "de" to "🇩🇪",
    "es" to "🇪🇸",
    "ar" to "🇸🇦",
    "zh" to "🇨🇳",
    "ja" to "🇯🇵"
)

@Composable
fun LanguageSwitcher(currentLang: String, onSelect: (String) -> Unit) {
    LazyRow(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp)
    ) {
        items(languages) { (code, flag) ->
            Box(
                modifier = Modifier
                    .clickable { onSelect(code) }
                    .alpha(if (code == currentLang) 1f else 0.5f),
                contentAlignment = Alignment.Center
            ) {
                Text(text = flag, fontSize = 24.sp)
            }
        }
    }
}
