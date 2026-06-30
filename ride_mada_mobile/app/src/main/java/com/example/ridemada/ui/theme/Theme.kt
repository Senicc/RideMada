package com.ridemada.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// ── Light Theme — Sky Blue ─────────────────────────────────────────────────
private val RideMadaLightScheme = lightColorScheme(
    primary            = SkyBlue500,
    onPrimary          = White,
    primaryContainer   = SkyBlue100,
    onPrimaryContainer = SkyBlue700,

    secondary            = SkyBlue400,
    onSecondary          = White,
    secondaryContainer   = SkyBlue50,
    onSecondaryContainer = SkyBlue700,

    tertiary            = GreenAccent,
    onTertiary          = White,
    tertiaryContainer   = GreenAccent.copy(alpha = 0.12f),
    onTertiaryContainer = GreenAccent,

    background        = SlateWhite,
    onBackground      = CoolGrey900,

    surface           = White,
    onSurface         = CoolGrey900,
    surfaceVariant    = CoolGrey100,
    onSurfaceVariant  = CoolGrey700,

    outline           = CoolGrey200,
    outlineVariant    = CoolGrey100,

    error             = ErrorRed,
    onError           = White,
    errorContainer    = ErrorRed.copy(alpha = 0.12f),
    onErrorContainer  = ErrorRed,

    scrim             = OverlayDark,
    inverseSurface    = CoolGrey900,
    inverseOnSurface  = SlateWhite,
    inversePrimary    = SkyBlue200,
)

// ── Dark Theme — Deep Ocean Blue ──────────────────────────────────────────
private val RideMadaDarkScheme = darkColorScheme(
    primary            = SkyBlue400,
    onPrimary          = CoolGrey900,
    primaryContainer   = SkyBlue700,
    onPrimaryContainer = SkyBlue100,

    secondary            = SkyBlue200,
    onSecondary          = CoolGrey900,
    secondaryContainer   = SkyBlue700.copy(alpha = 0.3f),
    onSecondaryContainer = SkyBlue200,

    tertiary            = GreenAccent,
    onTertiary          = CoolGrey900,
    tertiaryContainer   = GreenAccent.copy(alpha = 0.2f),
    onTertiaryContainer = GreenAccent,

    background        = CoolGrey900,
    onBackground      = SlateWhite,

    surface           = Color(0xFF152028),
    onSurface         = SlateWhite,
    surfaceVariant    = Color(0xFF1E2F3A),
    onSurfaceVariant  = CoolGrey200,

    outline           = Color(0xFF2D4555),
    outlineVariant    = Color(0xFF1E2F3A),

    error             = Color(0xFFF87171),
    onError           = CoolGrey900,
    errorContainer    = ErrorRed.copy(alpha = 0.20f),
    onErrorContainer  = Color(0xFFF87171),

    scrim             = OverlayDark,
    inverseSurface    = CoolGrey100,
    inverseOnSurface  = CoolGrey900,
    inversePrimary    = SkyBlue600,
)

@Composable
fun RideMadaTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = if (darkTheme) RideMadaDarkScheme else RideMadaLightScheme,
        typography  = Typography,
        shapes      = Shapes,
        content     = content,
    )
}