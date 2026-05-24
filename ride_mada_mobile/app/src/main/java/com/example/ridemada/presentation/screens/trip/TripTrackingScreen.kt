package com.ridemada.presentation.screens.trip

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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import com.ridemada.presentation.components.RideMadaButton
import com.ridemada.presentation.navigation.Screen
import com.ridemada.ui.theme.BrandAccent
import com.ridemada.ui.theme.DriverGreen
import kotlinx.coroutines.delay

enum class TripPhase { SEARCHING, DRIVER_ASSIGNED, EN_ROUTE, ARRIVED }

@Composable
fun TripTrackingScreen(
    destination: String,
    price: Int,
    navController: NavHostController,
) {
    var phase by remember { mutableStateOf(TripPhase.SEARCHING) }

    LaunchedEffect(Unit) {
        delay(2000)
        phase = TripPhase.DRIVER_ASSIGNED
        delay(3000)
        phase = TripPhase.EN_ROUTE
        delay(4000)
        phase = TripPhase.ARRIVED
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(24.dp),
    ) {
        Spacer(modifier = Modifier.height(32.dp))
        Text(
            text = when (phase) {
                TripPhase.SEARCHING -> "Recherche d'un chauffeur..."
                TripPhase.DRIVER_ASSIGNED -> "Chauffeur assigné"
                TripPhase.EN_ROUTE -> "En route vers vous"
                TripPhase.ARRIVED -> "Course terminée"
            },
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = destination,
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )

        Spacer(modifier = Modifier.height(32.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(56.dp)
                            .clip(CircleShape)
                            .background(DriverGreen.copy(alpha = 0.2f)),
                        contentAlignment = Alignment.Center,
                    ) {
                        Icon(Icons.Default.Person, contentDescription = null, tint = DriverGreen)
                    }
                    Spacer(modifier = Modifier.width(16.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = if (phase == TripPhase.SEARCHING) "—" else "Jean Rakoto",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                        )
                        Text(
                            text = if (phase == TripPhase.SEARCHING) "Matching en cours" else "Toyota Corolla • 4.9 ★",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                    if (phase != TripPhase.SEARCHING) {
                        IconButton(onClick = {
                            navController.navigate(
                                Screen.Chat.createRoute("driver-demo", "trip-demo"),
                            )
                        }) {
                            Icon(Icons.Default.Chat, contentDescription = "Chat", tint = MaterialTheme.colorScheme.primary)
                        }
                    }
                }

                if (phase == TripPhase.SEARCHING) {
                    Spacer(modifier = Modifier.height(16.dp))
                    LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
                } else {
                    Spacer(modifier = Modifier.height(16.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                    ) {
                        TripStep("Assigné", phase.ordinal >= 1, BrandAccent)
                        TripStep("En route", phase.ordinal >= 2, BrandAccent)
                        TripStep("Arrivé", phase.ordinal >= 3, BrandAccent)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.weight(1f))

        if (phase == TripPhase.ARRIVED) {
            RideMadaButton(
                text = "Payer $price Ar",
                onClick = {
                    navController.navigate(Screen.Payment.createRoute(price.toString())) {
                        popUpTo(Screen.Map.route) { inclusive = false }
                    }
                },
            )
            Spacer(modifier = Modifier.height(12.dp))
        }

        OutlinedButton(
            onClick = { navController.popBackStack(Screen.Map.route, false) },
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text(if (phase == TripPhase.ARRIVED) "Retour à l'accueil" else "Annuler")
        }
    }
}

@Composable
private fun TripStep(label: String, active: Boolean, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Box(
            modifier = Modifier
                .size(12.dp)
                .clip(CircleShape)
                .background(if (active) color else MaterialTheme.colorScheme.outline),
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = if (active) color else MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}
