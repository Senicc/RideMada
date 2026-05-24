package com.ridemada.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val RideMadaDarkScheme = darkColorScheme(
    primary            = BrandPrimary,
    onPrimary          = Color(0xFF001F29),
    primaryContainer   = CyanDark,
    onPrimaryContainer = CyanLight,

    secondary            = DriverGreen,
    onSecondary          = Color(0xFF00201A),
    secondaryContainer   = DriverGreenDark,
    onSecondaryContainer = DriverGreenLight,

    tertiary            = AdminGold,
    onTertiary          = Color(0xFF2A1800),
    tertiaryContainer   = AdminGoldDark,
    onTertiaryContainer = AdminGoldLight,

    background        = DarkBackground,
    onBackground      = TextPrimary,

    surface           = DarkSurface,
    onSurface         = TextPrimary,
    surfaceVariant    = DarkSurface2,
    onSurfaceVariant  = TextSecondary,

    outline           = Divider,
    outlineVariant    = DarkSurfaceVar,

    error             = StatusError,
    onError           = White,
    errorContainer    = Color(0xFF5C0000),
    onErrorContainer  = Color(0xFFFFB3B3),

    inverseSurface    = MapSheetSurface,
    inverseOnSurface  = Color(0xFF1A1A1A),
    inversePrimary    = CyanDark,

    scrim             = Overlay,
)

private val RideMadaLightScheme = lightColorScheme(
    primary            = Color(0xFF000000),
    onPrimary          = White,
    primaryContainer   = Color(0xFFE8E8E8),
    onPrimaryContainer = Color(0xFF1A1A1A),

    secondary            = BrandAccent,
    onSecondary          = White,
    secondaryContainer   = Color(0xFFE8F8EF),
    onSecondaryContainer = Color(0xFF004D2A),

    tertiary            = AdminGold,
    onTertiary          = Color(0xFF2A1800),

    background        = Color(0xFFF7F7F7),
    onBackground      = Color(0xFF1A1A1A),
    surface           = White,
    onSurface         = Color(0xFF1A1A1A),
    surfaceVariant    = Color(0xFFF0F0F0),
    onSurfaceVariant  = Color(0xFF6B6B6B),
    outline           = Color(0xFFE0E0E0),
    error             = StatusError,
)

@Composable
fun RideMadaTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = if (darkTheme) RideMadaDarkScheme else RideMadaLightScheme,
        typography  = Typography,
        content     = content,
    )
}