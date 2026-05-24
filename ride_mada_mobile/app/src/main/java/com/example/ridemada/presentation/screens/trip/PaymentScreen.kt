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
import androidx.navigation.NavHostController
import com.ridemada.presentation.components.RideMadaButton
import com.ridemada.presentation.navigation.Screen
import com.ridemada.ui.theme.BrandAccent

@Composable
fun PaymentScreen(
    amount: Int,
    navController: NavHostController,
) {
    var selectedMethod by remember { mutableStateOf("CASH") }
    var paid by remember { mutableStateOf(false) }

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

        Spacer(modifier = Modifier.weight(1f))

        if (paid) {
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
                    Text("Paiement simulé avec succès", fontWeight = FontWeight.SemiBold)
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
            RideMadaButton(
                text = "Noter le chauffeur",
                onClick = {
                    navController.navigate(Screen.Rating.createRoute("driver-demo")) {
                        popUpTo(Screen.Home.route) { inclusive = false }
                    }
                },
            )
        } else {
            RideMadaButton(
                text = "Confirmer le paiement",
                onClick = { paid = true },
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
