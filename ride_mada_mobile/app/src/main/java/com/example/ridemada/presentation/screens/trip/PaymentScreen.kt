package com.ridemada.presentation.screens.trip

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import com.ridemada.presentation.components.RideMadaButton
import com.ridemada.presentation.navigation.Screen
import com.ridemada.presentation.viewmodel.PaymentViewModel
import com.ridemada.ui.theme.BrandAccent

@Composable
fun PaymentScreen(
    rideRequestId: String,
    amount: Int,
    driverId: String,
    navController: NavHostController,
    viewModel: PaymentViewModel = hiltViewModel(),
) {
    var selectedMethod by remember { mutableStateOf("CASH") }
    var mobilePhone by remember { mutableStateOf("") }
    val state by viewModel.state.collectAsState()
    val needsPhone = selectedMethod != "CASH"

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(24.dp),
    ) {
        Spacer(modifier = Modifier.height(40.dp))
        Text(
            text = "Paiement",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "$amount Ar",
            style = MaterialTheme.typography.displaySmall,
            fontWeight = FontWeight.ExtraBold,
            color = BrandAccent,
        )

        Spacer(modifier = Modifier.height(32.dp))

        PaymentMethod("Espèces", Icons.Default.Payments, "CASH", selectedMethod) { selectedMethod = it }
        PaymentMethod("MVola", Icons.Default.PhoneAndroid, "MVOLA", selectedMethod) { selectedMethod = it }
        PaymentMethod("Orange Money", Icons.Default.AccountBalanceWallet, "ORANGE", selectedMethod) { selectedMethod = it }
        PaymentMethod("Airtel Money", Icons.Default.SimCard, "AIRTEL", selectedMethod) { selectedMethod = it }

        if (needsPhone) {
            Spacer(modifier = Modifier.height(12.dp))
            OutlinedTextField(
                value = mobilePhone,
                onValueChange = { mobilePhone = it },
                label = { Text("Numéro Mobile Money") },
                placeholder = { Text("034 XX XXX XX") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
            )
        }

        state.instructions?.let { instructions ->
            Spacer(modifier = Modifier.height(12.dp))
            Card(colors = CardDefaults.cardColors(containerColor = BrandAccent.copy(alpha = 0.1f))) {
                Text(
                    instructions,
                    modifier = Modifier.padding(12.dp),
                    style = MaterialTheme.typography.bodyMedium,
                )
            }
        }

        if (state.isPolling) {
            Spacer(modifier = Modifier.height(12.dp))
            LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
            Text(
                "En attente de confirmation sur votre téléphone...",
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.padding(top = 8.dp),
            )
        }

        state.error?.let {
            Spacer(modifier = Modifier.height(12.dp))
            Text(it, color = MaterialTheme.colorScheme.error)
        }

        Spacer(modifier = Modifier.weight(1f))

        if (state.isPaid) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = BrandAccent.copy(alpha = 0.15f)),
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Icon(Icons.Default.CheckCircle, contentDescription = null, tint = BrandAccent)
                    Spacer(modifier = Modifier.width(12.dp))
                    Text("Paiement confirmé", fontWeight = FontWeight.SemiBold)
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
            RideMadaButton(
                text = "Noter le chauffeur",
                onClick = {
                    navController.navigate(Screen.Rating.createRoute(driverId)) {
                        popUpTo(Screen.Home.route) { inclusive = false }
                    }
                },
            )
        } else {
            RideMadaButton(
                text = when {
                    state.isLoading -> "Traitement..."
                    state.isPolling -> "Vérification..."
                    else -> "Confirmer le paiement"
                },
                onClick = {
                    viewModel.processPayment(rideRequestId, selectedMethod, mobilePhone) { }
                },
                enabled = !state.isLoading && !state.isPolling && rideRequestId.isNotBlank() &&
                    (!needsPhone || mobilePhone.length >= 9),
                isLoading = state.isLoading,
            )
        }
    }
}

@Composable
private fun PaymentMethod(
    label: String,
    icon: ImageVector,
    value: String,
    selected: String,
    onSelect: (String) -> Unit,
) {
    val isSelected = selected == value
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp)
            .border(
                width = if (isSelected) 2.dp else 1.dp,
                color = if (isSelected) BrandAccent else MaterialTheme.colorScheme.outline,
                shape = RoundedCornerShape(16.dp),
            )
            .clickable { onSelect(value) },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) BrandAccent.copy(alpha = 0.08f)
            else MaterialTheme.colorScheme.surface,
        ),
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Icon(icon, contentDescription = null, tint = if (isSelected) BrandAccent else MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(modifier = Modifier.width(16.dp))
            Text(label, style = MaterialTheme.typography.titleMedium, modifier = Modifier.weight(1f))
            if (isSelected) Icon(Icons.Default.CheckCircle, contentDescription = null, tint = BrandAccent)
        }
    }
}
