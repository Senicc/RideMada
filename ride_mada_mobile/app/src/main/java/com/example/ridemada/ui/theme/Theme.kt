package com.ridemada.ui.theme

import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val RideMadaColorScheme = darkColorScheme(
    primary = Color(0xFF00D4FF),        // Bleu cyan moderne
    secondary = Color(0xFF00B2FF),
    background = Color(0xFF0A0E1A),
    surface = Color(0xFF121A2C),
    onPrimary = Color.Black,
    onBackground = Color.White,
    onSurface = Color.White
)

@Composable
fun RideMadaTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = RideMadaColorScheme,
        typography = Typography,
        content = content
    )
}