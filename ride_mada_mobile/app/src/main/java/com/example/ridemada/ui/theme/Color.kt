package com.ridemada.ui.theme

import androidx.compose.ui.graphics.Color

// ── Sky Blue Brand Palette ─────────────────────────────────────────────────
val SkyBlue50  = Color(0xFFE1F5FE)   // Ultra light sky – backgrounds
val SkyBlue100 = Color(0xFFB3E5FC)   // Light sky – chips, containers
val SkyBlue200 = Color(0xFF81D4FA)   // Soft sky
val SkyBlue400 = Color(0xFF29B6F6)   // Main sky blue (buttons, FABs)
val SkyBlue500 = Color(0xFF03A9F4)   // Rich sky – primary brand color
val SkyBlue600 = Color(0xFF039BE5)   // Deep sky – pressed states
val SkyBlue700 = Color(0xFF0288D1)   // Dark sky – dark-theme primary

// ── Neutrals ───────────────────────────────────────────────────────────────
val SlateWhite  = Color(0xFFF0F9FF)  // Off-white with sky tint
val CoolGrey50  = Color(0xFFF8FBFF)  // Lightest surface
val CoolGrey100 = Color(0xFFEAF2FB)  // Card / surface variant
val CoolGrey200 = Color(0xFFCDD8E3)  // Dividers, borders
val CoolGrey400 = Color(0xFF8FA4B2)  // Placeholder / muted text
val CoolGrey700 = Color(0xFF3D5465)  // Body text on light
val CoolGrey900 = Color(0xFF0F1E27)  // Deep dark background

// ── Accents ────────────────────────────────────────────────────────────────
val BrandAccent  = SkyBlue500        // Primary CTA – sky blue
val GreenAccent  = Color(0xFF00C28B) // Success – emerald green
val ErrorRed     = Color(0xFFEF4444) // Errors
val WarningGold  = Color(0xFFF59E0B) // Warnings, Admin gold
val PurpleAccent = Color(0xFF7C3AED) // Premium badge

// ── Overlays ───────────────────────────────────────────────────────────────
val OverlayDark = Color(0x80000000)
val Transparent = Color(0x00000000)

// ── Backward Compatibility Aliases ─────────────────────────────────────────
val Black           = Color(0xFF000000)
val White           = Color(0xFFFFFFFF)
val DriverGreen     = GreenAccent
val StatusError     = ErrorRed
val StatusSuccess   = GreenAccent
val StatusPending   = CoolGrey400
val AdminGold       = WarningGold
val CyanPrimary     = BrandAccent
val DarkBackground  = CoolGrey900
