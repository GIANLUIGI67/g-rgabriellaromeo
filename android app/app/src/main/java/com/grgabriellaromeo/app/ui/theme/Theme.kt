package com.grgabriellaromeo.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = Gold,
    onPrimary = Black,
    primaryContainer = DarkGray,
    onPrimaryContainer = GoldLight,
    secondary = GoldLight,
    onSecondary = Black,
    background = Black,
    onBackground = White,
    surface = DarkGray,
    onSurface = White,
    surfaceVariant = MidGray,
    onSurfaceVariant = LightGray,
    error = ErrorRed,
    onError = Black,
    outline = LightGray
)

@Composable
fun GRTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = Typography,
        content = content
    )
}
