package com.ridemada.presentation.screens.trip

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.outlined.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import com.ridemada.presentation.components.RideMadaButton
import com.ridemada.presentation.navigation.Screen
import com.ridemada.presentation.viewmodel.RatingViewModel
import com.ridemada.ui.theme.AdminGold

@Composable
fun RatingScreen(
    driverId: String,
    navController: NavHostController,
    viewModel: RatingViewModel = hiltViewModel(),
) {
    var rating by remember { mutableIntStateOf(5) }
    var comment by remember { mutableStateOf("") }
    val state by viewModel.state.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Spacer(modifier = Modifier.height(48.dp))
        Text(
            text = "Comment s'est passée votre course ?",
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
        )
        Spacer(modifier = Modifier.height(32.dp))
        Row {
            (1..5).forEach { star ->
                IconButton(onClick = { rating = star }) {
                    Icon(
                        imageVector = if (star <= rating) Icons.Filled.Star else Icons.Outlined.Star,
                        contentDescription = null,
                        tint = AdminGold,
                        modifier = Modifier.size(40.dp),
                    )
                }
            }
        }
        Spacer(modifier = Modifier.height(24.dp))
        OutlinedTextField(
            value = comment,
            onValueChange = { comment = it },
            modifier = Modifier.fillMaxWidth(),
            label = { Text("Commentaire (optionnel)") },
            minLines = 3,
        )
        Spacer(modifier = Modifier.weight(1f))
        RideMadaButton(
            text = "Envoyer",
            onClick = {
                viewModel.submit(driverId, rating, comment) {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Home.route) { inclusive = true }
                    }
                }
            },
            isLoading = state.isLoading,
        )
        if (state.error != null) {
            Spacer(modifier = Modifier.height(8.dp))
            Text(state.error!!, color = MaterialTheme.colorScheme.error)
        }
    }
}
