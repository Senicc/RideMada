package com.ridemada.presentation.screens.admin

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import com.ridemada.presentation.components.RoleChip
import com.ridemada.presentation.viewmodel.AdminViewModel
import com.ridemada.ui.theme.AdminGold
import com.ridemada.ui.theme.DriverGreen
import com.ridemada.ui.theme.StatusError

@Composable
fun AdminUsersScreen(
    navController: NavHostController,
    viewModel: AdminViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsState()
    LaunchedEffect(Unit) { viewModel.loadUsers() }

    AdminListScaffold(title = "Utilisateurs", accent = AdminGold) {
        if (state.isLoading) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else {
            LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(state.users) { user ->
                    Card(shape = RoundedCornerShape(16.dp)) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(user.name, fontWeight = FontWeight.Bold)
                                Text(user.phone, style = MaterialTheme.typography.bodySmall)
                                RoleChip(user.role)
                            }
                            TextButton(
                                onClick = { viewModel.toggleBlockUser(user.id, user.isBlocked) },
                            ) {
                                Text(
                                    if (user.isBlocked) "Débloquer" else "Bloquer",
                                    color = if (user.isBlocked) DriverGreen else StatusError,
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun AdminDriversScreen(
    navController: NavHostController,
    viewModel: AdminViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsState()
    LaunchedEffect(Unit) { viewModel.loadPendingDrivers() }

    AdminListScaffold(title = "Validation conducteurs", accent = DriverGreen) {
        if (state.pendingDrivers.isEmpty() && !state.isLoading) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("Aucun conducteur en attente", color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        } else {
            LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(state.pendingDrivers) { driver ->
                    Card(shape = RoundedCornerShape(16.dp)) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Column {
                                Text(driver.user?.name ?: "Conducteur", fontWeight = FontWeight.Bold)
                                Text(driver.user?.phone ?: "", style = MaterialTheme.typography.bodySmall)
                            }
                            Button(
                                onClick = { viewModel.approveDriver(driver.id) },
                                colors = ButtonDefaults.buttonColors(containerColor = DriverGreen),
                            ) {
                                Text("Approuver")
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun AdminRidesScreen(
    navController: NavHostController,
    viewModel: AdminViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsState()
    LaunchedEffect(Unit) { viewModel.loadActiveRides() }

    AdminListScaffold(title = "Courses en temps réel", accent = StatusError) {
        LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(state.activeRides) { ride ->
                Card(shape = RoundedCornerShape(16.dp)) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(ride.departureAddress, fontWeight = FontWeight.Bold, maxLines = 1)
                        Text("→ ${ride.arrivalAddress}", style = MaterialTheme.typography.bodySmall)
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                            AssistChip(
                                onClick = {},
                                label = { Text(ride.status) },
                                leadingIcon = { Icon(Icons.Default.LocalTaxi, contentDescription = null) },
                            )
                            Text("${ride.price.toInt()} Ar", fontWeight = FontWeight.Bold, color = AdminGold)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun AdminListScaffold(
    title: String,
    accent: androidx.compose.ui.graphics.Color,
    content: @Composable BoxScope.() -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background),
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(MaterialTheme.colorScheme.surface)
                .padding(top = 40.dp, bottom = 16.dp, start = 24.dp, end = 24.dp),
        ) {
            Text(title, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold, color = accent)
        }
        Box(modifier = Modifier.fillMaxSize(), content = content)
    }
}
