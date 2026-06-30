package com.ridemada.presentation.screens.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController

private val faqItems = listOf(
    "Comment commander une course ?" to "Ouvrez l'onglet Carte, saisissez votre destination, estimez le prix puis appuyez sur Commander.",
    "Comment devenir chauffeur ?" to "Allez dans Profil > Devenir chauffeur, remplissez le formulaire et attendez la validation admin.",
    "Quels moyens de paiement ?" to "Espèces, MVola, Orange Money et Airtel Money sont disponibles. MVola/Orange/Airtel seront activés dès l'intégration opérateur.",
    "Comment annuler ?" to "Pendant la recherche ou le trajet, utilisez le bouton Annuler la course sur l'écran de suivi.",
    "Contacter le support" to "Email : support@ridemada.com | Téléphone : +261 20 00 000 00",
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HelpScreen(navController: NavHostController) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Aide & Support", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Retour")
                    }
                },
            )
        },
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(MaterialTheme.colorScheme.background)
                .verticalScroll(rememberScrollState())
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            faqItems.forEach { (question, answer) ->
                Card(shape = MaterialTheme.shapes.medium) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(question, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(answer, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }
    }
}
