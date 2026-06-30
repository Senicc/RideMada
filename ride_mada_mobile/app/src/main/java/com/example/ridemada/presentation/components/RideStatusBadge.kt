package com.ridemada.presentation.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ridemada.ui.theme.AdminGold
import com.ridemada.ui.theme.BrandAccent
import com.ridemada.ui.theme.DriverGreen
import com.ridemada.ui.theme.ErrorRed
import com.ridemada.ui.theme.GreenAccent

private data class StatusStyle(val color: Color, val label: String)

private fun rideStatusStyle(status: String): StatusStyle = when (status.uppercase()) {
    "PENDING"              -> StatusStyle(Color(0xFFB0BEC5), "En attente")
    "ACTIVE", "CONFIRMED"  -> StatusStyle(BrandAccent,      "En cours")
    "COMPLETED"            -> StatusStyle(GreenAccent,       "Terminé")
    "CANCELLED"            -> StatusStyle(ErrorRed,          "Annulé")
    else                   -> StatusStyle(Color.Gray,         status)
}

@Composable
fun RideStatusBadge(
    status: String,
    modifier: Modifier = Modifier
) {
    val style = rideStatusStyle(status)
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(8.dp))
            .background(style.color.copy(alpha = 0.15f))
            .padding(horizontal = 10.dp, vertical = 4.dp)
    ) {
        Text(
            text  = style.label,
            color = style.color,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
        )
    }
}

private data class RoleStyle(val color: Color, val label: String)

@Composable
fun RoleChip(
    role: String,
    modifier: Modifier = Modifier
) {
    val style = when (role.uppercase()) {
        "ADMIN"  -> RoleStyle(AdminGold,   "Administrateur")
        "DRIVER" -> RoleStyle(DriverGreen, "Conducteur")
        else     -> RoleStyle(BrandAccent, "Passager")
    }
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(8.dp))
            .background(style.color.copy(alpha = 0.15f))
            .padding(horizontal = 10.dp, vertical = 4.dp)
    ) {
        Text(
            text  = style.label,
            color = style.color,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
        )
    }
}
