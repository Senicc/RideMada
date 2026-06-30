package com.ridemada.presentation.screens.driver

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DirectionsCar
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import com.ridemada.presentation.viewmodel.DriverDashboardViewModel
import com.ridemada.ui.theme.GreenAccent
import com.ridemada.ui.theme.SkyBlue400
import com.ridemada.ui.theme.SkyBlue600
import java.text.NumberFormat
import java.util.Locale

@Composable
fun DriverHomeScreen(
    navController: NavHostController,
    viewModel: DriverDashboardViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsState()
    val formatter = remember { NumberFormat.getNumberInstance(Locale.FRANCE) }

    LaunchedEffect(Unit) { viewModel.load() }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(rememberScrollState()),
    ) {
        // ── Status Header with gradient ──
        val isOnline = state.isOnline
        val headerGradient = if (isOnline)
            Brush.verticalGradient(listOf(SkyBlue600, SkyBlue400))
        else
            Brush.verticalGradient(listOf(MaterialTheme.colorScheme.surfaceVariant, MaterialTheme.colorScheme.surfaceVariant))
        val headerFg = if (isOnline) Color.White else MaterialTheme.colorScheme.onSurfaceVariant

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(headerGradient)
                .padding(top = 48.dp, bottom = 32.dp, start = 24.dp, end = 24.dp),
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Column {
                    Text(
                        text = if (isOnline) "EN LIGNE" else "HORS LIGNE",
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.Bold,
                        color = headerFg.copy(alpha = 0.75f),
                        letterSpacing = 1.5.sp,
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = when {
                            !state.isApproved -> "En attente de validation"
                            isOnline -> "En attente de courses..."
                            else -> "Activez pour recevoir des demandes"
                        },
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Black,
                        color = headerFg,
                    )
                }
                Switch(
                    checked = isOnline,
                    onCheckedChange = { viewModel.setOnline(it) },
                    enabled = state.isApproved,
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = SkyBlue600,
                        checkedTrackColor = Color.White,
                        uncheckedThumbColor = MaterialTheme.colorScheme.onSurfaceVariant,
                        uncheckedTrackColor = MaterialTheme.colorScheme.outline,
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // ── Stats Grid ──
        Text(
            "Résumé de la journée",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 24.dp),
        )
        Spacer(modifier = Modifier.height(16.dp))
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            DriverStatCard(
                title = "Revenus",
                value = "${formatter.format(state.totalRevenue.toLong())} Ar",
                accentColor = GreenAccent,
                modifier = Modifier.weight(1f),
            )
            DriverStatCard(
                title = "Courses aujourd'hui",
                value = "${state.todayTrips}",
                accentColor = MaterialTheme.colorScheme.secondary,
                modifier = Modifier.weight(1f),
            )
        }
        Spacer(modifier = Modifier.height(12.dp))
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            DriverStatCard(
                title = "Terminées",
                value = state.completedRides.toString(),
                accentColor = MaterialTheme.colorScheme.tertiary,
                modifier = Modifier.weight(1f),
            )
            DriverStatCard(
                title = "En attente",
                value = state.pendingRides.size.toString(),
                accentColor = MaterialTheme.colorScheme.primary,
                modifier = Modifier.weight(1f),
            )
        }

        Spacer(modifier = Modifier.height(32.dp))
        HorizontalDivider(modifier = Modifier.padding(horizontal = 24.dp), thickness = 1.dp, color = MaterialTheme.colorScheme.outline)
        Spacer(modifier = Modifier.height(24.dp))

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            OutlinedButton(
                onClick = { navController.navigate(com.ridemada.presentation.navigation.Screen.CreateRide.route) },
                modifier = Modifier.weight(1f),
            ) { Text("Publier trajet") }
            OutlinedButton(
                onClick = { navController.navigate(com.ridemada.presentation.navigation.Screen.MyVehicles.route) },
                modifier = Modifier.weight(1f),
            ) { Text("Véhicules") }
        }

        Spacer(modifier = Modifier.height(24.dp))
        Text(
            "Demandes à la demande",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 24.dp),
        )
        Spacer(modifier = Modifier.height(12.dp))

        if (!isOnline) {
            EmptyDriverBox("Passez en ligne pour recevoir des demandes")
        } else if (state.pendingRequests.isEmpty()) {
            EmptyDriverBox("Aucune demande de course pour le moment")
        } else {
            state.pendingRequests.forEach { request ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp, vertical = 6.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(request.pickupAddress, fontWeight = FontWeight.Bold, maxLines = 1)
                        Text("→ ${request.dropoffAddress}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Text("${request.estimatedPrice.toInt()} Ar", fontWeight = FontWeight.Bold, color = GreenAccent)
                            Button(onClick = { viewModel.acceptRequest(request.id) }) {
                                Text("Accepter")
                            }
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
        Text(
            "Trajets partagés actifs",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 24.dp),
        )
        Spacer(modifier = Modifier.height(12.dp))

        if (state.pendingRides.isEmpty()) {
            EmptyDriverBox("Aucun trajet partagé actif")
        } else {
            state.pendingRides.forEach { ride ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp, vertical = 6.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Icon(Icons.Default.DirectionsCar, contentDescription = null, tint = GreenAccent)
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(ride.departureAddress, fontWeight = FontWeight.Bold, maxLines = 1)
                            Text("→ ${ride.arrivalAddress}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Text("${ride.price.toInt()} Ar", fontWeight = FontWeight.Bold, color = GreenAccent)
                    }
                }
            }
        }

        state.error?.let {
            Text(it, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(24.dp))
        }
        Spacer(modifier = Modifier.height(100.dp))
    }
}

@Composable
private fun DriverStatCard(title: String, value: String, accentColor: Color, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier.height(100.dp),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    ) {
        Column(
            modifier = Modifier
                .padding(16.dp)
                .fillMaxSize(),
            verticalArrangement = Arrangement.SpaceBetween,
        ) {
            Text(title, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(value, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Black, color = accentColor)
        }
    }
}

@Composable
private fun EmptyDriverBox(message: String) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp)
            .height(100.dp)
            .background(MaterialTheme.colorScheme.surface, RoundedCornerShape(12.dp)),
        contentAlignment = Alignment.Center,
    ) {
        Text(message, color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodyMedium)
    }
}
