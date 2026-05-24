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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import com.ridemada.presentation.viewmodel.DriverDashboardViewModel
import com.ridemada.ui.theme.DriverGreen
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
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(if (state.isOnline) DriverGreen else MaterialTheme.colorScheme.surfaceVariant)
                .padding(top = 40.dp, bottom = 24.dp, start = 24.dp, end = 24.dp),
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Column {
                    Text(
                        text = if (state.isOnline) "VOUS ÊTES EN LIGNE" else "HORS LIGNE",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.ExtraBold,
                        color = if (state.isOnline) Color.Black else MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Text(
                        text = when {
                            !state.isApproved -> "Compte en attente de validation admin"
                            state.isOnline -> "En attente de courses..."
                            else -> "Activez pour recevoir des demandes"
                        },
                        style = MaterialTheme.typography.bodyMedium,
                        color = if (state.isOnline) Color.Black.copy(alpha = 0.7f) else MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                Switch(
                    checked = state.isOnline,
                    onCheckedChange = { viewModel.setOnline(it) },
                    enabled = state.isApproved,
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
        Text(
            "Résumé",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 24.dp),
        )
        Spacer(modifier = Modifier.height(16.dp))
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            DriverStatCard("Revenus", "${formatter.format(state.totalRevenue.toLong())} Ar", DriverGreen, Modifier.weight(1f))
            DriverStatCard("Aujourd'hui", "${state.todayTrips} courses", MaterialTheme.colorScheme.primary, Modifier.weight(1f))
        }
        Spacer(modifier = Modifier.height(12.dp))
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            DriverStatCard("Terminées", state.completedRides.toString(), MaterialTheme.colorScheme.tertiary, Modifier.weight(1f))
            DriverStatCard("En attente", state.pendingRides.size.toString(), MaterialTheme.colorScheme.secondary, Modifier.weight(1f))
        }

        Spacer(modifier = Modifier.height(32.dp))
        Text(
            "Courses publiées",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 24.dp),
        )
        Spacer(modifier = Modifier.height(12.dp))

        if (!state.isOnline) {
            EmptyDriverBox("Passez en ligne pour recevoir des demandes")
        } else if (state.pendingRides.isEmpty()) {
            EmptyDriverBox("Aucune course active — publiez un trajet")
        } else {
            state.pendingRides.forEach { ride ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp, vertical = 6.dp),
                    shape = RoundedCornerShape(16.dp),
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Icon(Icons.Default.DirectionsCar, contentDescription = null, tint = DriverGreen)
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(ride.departureAddress, fontWeight = FontWeight.Bold, maxLines = 1)
                            Text("→ ${ride.arrivalAddress}", style = MaterialTheme.typography.bodySmall)
                        }
                        Text("${ride.price.toInt()} Ar", fontWeight = FontWeight.Bold, color = DriverGreen)
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
private fun DriverStatCard(title: String, value: String, color: Color, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier.height(100.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    ) {
        Column(
            modifier = Modifier.padding(16.dp).fillMaxSize(),
            verticalArrangement = Arrangement.SpaceBetween,
        ) {
            Text(title, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(value, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = color)
        }
    }
}

@Composable
private fun EmptyDriverBox(message: String) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp)
            .height(120.dp)
            .background(MaterialTheme.colorScheme.surface, RoundedCornerShape(16.dp)),
        contentAlignment = Alignment.Center,
    ) {
        Text(message, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}
