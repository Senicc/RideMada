package com.ridemada.presentation.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ridemada.ui.theme.StatusError
import com.ridemada.ui.theme.StatusPending
import com.ridemada.ui.theme.StatusSuccess
import com.ridemada.ui.theme.CyanPrimary

@Composable
fun RideStatusBadge(
    status: String,
    modifier: Modifier = Modifier
) {
    val (color, text) = when (status.uppercase()) {
        "PENDING" -> StatusPending to "En attente"
        "ACTIVE", "CONFIRMED" -> CyanPrimary to "En cours"
        "COMPLETED" -> StatusSuccess to "Terminé"
        "CANCELLED" -> StatusError to "Annulé"
        else -> Color.Gray to status
    }

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(8.dp))
            .background(color.copy(alpha = 0.15f))
            .padding(horizontal = 10.dp, vertical = 4.dp)
    ) {
        Text(
            text = text,
            color = color,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
fun RoleChip(
    role: String,
    modifier: Modifier = Modifier
) {
    val (color, text) = when (role.uppercase()) {
        "ADMIN" -> com.ridemada.ui.theme.AdminGold to "Administrateur"
        "DRIVER" -> com.ridemada.ui.theme.DriverGreen to "Conducteur"
        else -> com.ridemada.ui.theme.CyanPrimary to "Passager"
    }

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(8.dp))
            .background(color.copy(alpha = 0.15f))
            .padding(horizontal = 10.dp, vertical = 4.dp)
    ) {
        Text(
            text = text,
            color = color,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold
        )
    }
}
