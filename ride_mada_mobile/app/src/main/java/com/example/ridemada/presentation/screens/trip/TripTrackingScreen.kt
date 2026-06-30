package com.ridemada.presentation.screens.trip

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import com.ridemada.presentation.components.RideMadaButton
import com.ridemada.presentation.navigation.Screen
import com.ridemada.presentation.viewmodel.TripPhase
import com.ridemada.presentation.viewmodel.TripViewModel
import com.ridemada.ui.theme.GreenAccent
import com.ridemada.ui.theme.BrandAccent
import com.ridemada.ui.theme.SkyBlue400
import com.ridemada.ui.theme.SkyBlue600

@Composable
fun TripTrackingScreen(
    rideRequestId: String,
    destination: String,
    price: Int,
    navController: NavHostController,
    viewModel: TripViewModel = hiltViewModel(),
) {
    val phase by viewModel.phase.collectAsState()
    val rideRequest by viewModel.rideRequest.collectAsState()
    val error by viewModel.error.collectAsState()

    LaunchedEffect(rideRequestId) {
        if (rideRequestId.isNotBlank()) {
            viewModel.observeRide(rideRequestId)
        }
    }

    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 1.15f,
        animationSpec = infiniteRepeatable(
            animation = tween(800, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "pulseScale",
    )

    val driverName = rideRequest?.driver?.user?.name ?: "—"
    val driverId = rideRequest?.driver?.user?.id.orEmpty()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(Brush.verticalGradient(listOf(SkyBlue600, SkyBlue400)))
                .padding(top = 48.dp, bottom = 32.dp, start = 24.dp, end = 24.dp),
        ) {
            Column {
                AnimatedContent(targetState = phase, label = "phaseText") { p ->
                    Text(
                        text = when (p) {
                            TripPhase.SEARCHING -> "Recherche d'un chauffeur..."
                            TripPhase.DRIVER_ASSIGNED -> "Chauffeur assigné !"
                            TripPhase.EN_ROUTE -> "Votre chauffeur arrive"
                            TripPhase.ARRIVED, TripPhase.COMPLETED -> "Vous êtes arrivé"
                        },
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Black,
                        color = Color.White,
                    )
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = destination,
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.White.copy(alpha = 0.8f),
                    maxLines = 1,
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        ) {
            Row(
                modifier = Modifier.padding(20.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Box(
                    modifier = Modifier
                        .size(56.dp)
                        .scale(if (phase == TripPhase.SEARCHING) pulseScale else 1f)
                        .clip(CircleShape)
                        .background(
                            if (phase == TripPhase.SEARCHING)
                                MaterialTheme.colorScheme.surfaceVariant
                            else
                                GreenAccent.copy(alpha = 0.2f)
                        ),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(
                        Icons.Default.Person,
                        contentDescription = null,
                        tint = if (phase == TripPhase.SEARCHING) MaterialTheme.colorScheme.onSurfaceVariant else GreenAccent,
                        modifier = Modifier.size(28.dp),
                    )
                }
                Spacer(modifier = Modifier.width(16.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = if (phase == TripPhase.SEARCHING) "—" else driverName,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                    )
                    Text(
                        text = if (phase == TripPhase.SEARCHING) "Matching en cours..." else "★ ${rideRequest?.driver?.user?.rating ?: 5f}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                if (phase != TripPhase.SEARCHING && driverId.isNotBlank()) {
                    IconButton(
                        onClick = { navController.navigate(Screen.Chat.createRoute(driverId, rideRequestId)) }
                    ) {
                        Icon(Icons.Default.Chat, contentDescription = "Chat", tint = BrandAccent)
                    }
                }
            }

            if (phase == TripPhase.SEARCHING) {
                LinearProgressIndicator(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp)
                        .padding(bottom = 16.dp),
                    color = MaterialTheme.colorScheme.primary,
                    trackColor = MaterialTheme.colorScheme.surfaceVariant,
                )
            } else {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    TripStepDot("Assigné", phase.ordinal >= 1, BrandAccent)
                    HorizontalDivider(modifier = Modifier.weight(1f).padding(horizontal = 8.dp), color = if (phase.ordinal >= 2) BrandAccent else MaterialTheme.colorScheme.outline)
                    TripStepDot("En route", phase.ordinal >= 2, BrandAccent)
                    HorizontalDivider(modifier = Modifier.weight(1f).padding(horizontal = 8.dp), color = if (phase.ordinal >= 3) GreenAccent else MaterialTheme.colorScheme.outline)
                    TripStepDot("Arrivé", phase.ordinal >= 3, GreenAccent)
                }
            }
        }

        error?.let {
            Text(it, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(24.dp))
        }

        Spacer(modifier = Modifier.weight(1f))

        Column(
            modifier = Modifier.padding(horizontal = 24.dp, vertical = 24.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            if (phase == TripPhase.ARRIVED || phase == TripPhase.COMPLETED) {
                RideMadaButton(
                    text = "Payer $price Ar",
                    onClick = {
                        val driverId = rideRequest?.driver?.user?.id.orEmpty().ifBlank { "unknown" }
                        navController.navigate(Screen.Payment.createRoute(rideRequestId, price, driverId)) {
                            popUpTo(Screen.Map.route) { inclusive = false }
                        }
                    },
                    containerColor = GreenAccent,
                    contentColor = Color.Black,
                )
            }
            OutlinedButton(
                onClick = {
                    if (phase == TripPhase.ARRIVED || phase == TripPhase.COMPLETED) {
                        navController.popBackStack(Screen.Map.route, false)
                    } else {
                        viewModel.cancelRide(rideRequestId) {
                            navController.popBackStack(Screen.Map.route, false)
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth().height(52.dp),
                shape = RoundedCornerShape(8.dp),
            ) {
                Text(if (phase == TripPhase.ARRIVED || phase == TripPhase.COMPLETED) "Retour à l'accueil" else "Annuler la course")
            }
        }
    }
}

@Composable
private fun TripStepDot(label: String, active: Boolean, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Box(
            modifier = Modifier
                .size(14.dp)
                .clip(CircleShape)
                .background(if (active) color else MaterialTheme.colorScheme.outline),
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            fontSize = 10.sp,
            color = if (active) color else MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}
