package com.ridemada.presentation.screens.driver

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
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
import com.ridemada.presentation.viewmodel.DriverDashboardViewModel
import com.ridemada.ui.theme.DriverGreen
import java.text.NumberFormat
import java.util.Locale

@Composable
fun DriverEarningsScreen(
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
                .background(MaterialTheme.colorScheme.surface)
                .padding(top = 40.dp, bottom = 16.dp, start = 24.dp, end = 24.dp),
        ) {
            Text("Mes gains", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
        }

        Column(modifier = Modifier.padding(24.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
            EarningsCard(
                title = "Revenus totaux",
                value = "${formatter.format(state.totalRevenue.toLong())} Ar",
                icon = Icons.Default.AttachMoney,
                color = DriverGreen,
            )
            EarningsCard(
                title = "Courses aujourd'hui",
                value = state.todayTrips.toString(),
                icon = Icons.Default.Today,
                color = MaterialTheme.colorScheme.primary,
            )
            EarningsCard(
                title = "Courses terminées",
                value = state.completedRides.toString(),
                icon = Icons.Default.CheckCircle,
                color = MaterialTheme.colorScheme.tertiary,
            )
        }
        Spacer(modifier = Modifier.height(100.dp))
    }
}

@Composable
private fun EarningsCard(
    title: String,
    value: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    color: androidx.compose.ui.graphics.Color,
) {
    Card(shape = RoundedCornerShape(20.dp), modifier = Modifier.fillMaxWidth()) {
        Row(modifier = Modifier.padding(20.dp), verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
            Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(32.dp))
            Spacer(modifier = Modifier.width(16.dp))
            Column {
                Text(title, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                Text(value, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, color = color)
            }
        }
    }
}
