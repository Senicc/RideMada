package com.ridemada.presentation.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.ridemada.ui.theme.SkyBlue400
import com.ridemada.ui.theme.SkyBlue600

@Composable
fun RideMadaButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    isLoading: Boolean = false,
    enabled: Boolean = true,
    containerColor: Color = Color.Unspecified, // Use gradient by default
    contentColor: Color = Color.White,
) {
    val alpha by animateFloatAsState(targetValue = if (enabled && !isLoading) 1f else 0.55f, label = "buttonAlpha")

    val shape = RoundedCornerShape(14.dp)

    // Use gradient if no custom containerColor provided
    val useGradient = containerColor == Color.Unspecified

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(54.dp)
            .shadow(
                elevation = if (enabled && !isLoading) 6.dp else 0.dp,
                shape = shape,
                ambientColor = SkyBlue400.copy(alpha = 0.35f),
                spotColor = SkyBlue600.copy(alpha = 0.40f),
            )
            .clip(shape)
            .then(
                if (useGradient) {
                    Modifier.background(
                        brush = Brush.horizontalGradient(
                            colors = if (enabled && !isLoading) listOf(SkyBlue400, SkyBlue600)
                                     else listOf(SkyBlue400.copy(alpha = 0.55f), SkyBlue600.copy(alpha = 0.55f))
                        )
                    )
                } else {
                    Modifier.background(containerColor.copy(alpha = alpha))
                }
            ),
        contentAlignment = Alignment.Center,
    ) {
        Button(
            onClick = onClick,
            enabled = enabled && !isLoading,
            shape = shape,
            colors = ButtonDefaults.buttonColors(
                containerColor = Color.Transparent,
                contentColor = contentColor,
                disabledContainerColor = Color.Transparent,
                disabledContentColor = contentColor.copy(alpha = 0.6f),
            ),
            elevation = ButtonDefaults.buttonElevation(
                defaultElevation = 0.dp,
                pressedElevation = 0.dp,
            ),
            modifier = Modifier.fillMaxSize(),
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    color = contentColor,
                    modifier = Modifier.size(22.dp),
                    strokeWidth = 2.5.dp,
                )
            } else {
                Text(
                    text = text,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = contentColor,
                )
            }
        }
    }
}

@Composable
fun RideMadaOutlinedButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    isLoading: Boolean = false,
    enabled: Boolean = true,
    color: Color = MaterialTheme.colorScheme.primary,
) {
    OutlinedButton(
        onClick = onClick,
        modifier = modifier
            .fillMaxWidth()
            .height(54.dp),
        enabled = enabled && !isLoading,
        shape = RoundedCornerShape(14.dp),
        colors = ButtonDefaults.outlinedButtonColors(contentColor = color),
    ) {
        if (isLoading) {
            CircularProgressIndicator(
                color = color,
                modifier = Modifier.size(22.dp),
                strokeWidth = 2.5.dp,
            )
        } else {
            Text(
                text = text,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
            )
        }
    }
}
