package com.ridemada.presentation.screens.admin

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import com.ridemada.presentation.components.StatCard
import com.ridemada.presentation.viewmodel.AdminViewModel
import com.ridemada.ui.theme.AdminGold
import com.ridemada.ui.theme.CyanPrimary
import com.ridemada.ui.theme.DriverGreen
import com.ridemada.ui.theme.StatusError
import java.text.NumberFormat
import java.util.Locale

@Composable
fun AdminDashboardScreen(
    navController: NavHostController,
    viewModel: AdminViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsState()
    val formatter = remember { NumberFormat.getNumberInstance(Locale.FRANCE) }

    LaunchedEffect(Unit) {
        viewModel.loadDashboard()
        viewModel.loadReports()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(rememberScrollState()),
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(MaterialTheme.colorScheme.surface)
                .padding(top = 40.dp, bottom = 24.dp, start = 24.dp, end = 24.dp),
        ) {
            Column {
                Text("Administration", style = MaterialTheme.typography.titleLarge, color = AdminGold)
                Text(
                    "Tableau de bord global",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                )
            }
        }

        if (state.isLoading && state.stats == null) {
            Box(modifier = Modifier.fillMaxWidth().padding(48.dp), contentAlignment = androidx.compose.ui.Alignment.Center) {
                CircularProgressIndicator(color = AdminGold)
            }
        }

        state.stats?.let { stats ->
            Column(
                modifier = Modifier.padding(horizontal = 24.dp, vertical = 16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    StatCard(
                        title = "Utilisateurs",
                        value = formatter.format(stats.totalUsers),
                        icon = Icons.Default.Group,
                        color = CyanPrimary,
                        modifier = Modifier.weight(1f),
                    )
                    StatCard(
                        title = "Conducteurs",
                        value = "${stats.approvedDrivers}/${stats.totalDrivers}",
                        icon = Icons.Default.Badge,
                        color = DriverGreen,
                        modifier = Modifier.weight(1f),
                    )
                }
                Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    StatCard(
                        title = "Courses actives",
                        value = stats.activeRides.toString(),
                        icon = Icons.Default.LocalTaxi,
                        color = StatusError,
                        modifier = Modifier.weight(1f),
                    )
                    StatCard(
                        title = "Revenus",
                        value = "${formatter.format(stats.totalRevenue.toLong())} Ar",
                        icon = Icons.Default.AttachMoney,
                        color = AdminGold,
                        modifier = Modifier.weight(1f),
                    )
                }
                if (stats.pendingDrivers > 0 || stats.pendingReports > 0) {
                    Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer)) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            if (stats.pendingDrivers > 0) {
                                Text("${stats.pendingDrivers} conducteur(s) en attente de validation")
                            }
                            if (stats.pendingReports > 0) {
                                Text("${stats.pendingReports} signalement(s) en attente", color = StatusError)
                            }
                        }
                    }
                }
            }
        }

        if (state.reports.isNotEmpty()) {
            Text(
                "Signalements récents",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(horizontal = 24.dp),
            )
            Spacer(modifier = Modifier.height(8.dp))
            state.reports.take(5).forEach { report ->
                ListItem(
                    headlineContent = { Text(report.reason, maxLines = 1) },
                    supportingContent = {
                        Text("${report.reporter?.name ?: "?"} → ${report.reported?.name ?: "?"}")
                    },
                    leadingContent = {
                        Icon(Icons.Default.Report, contentDescription = null, tint = StatusError)
                    },
                )
            }
        }

        Spacer(modifier = Modifier.height(100.dp))
    }
}
