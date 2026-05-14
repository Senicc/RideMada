package com.ridemada.presentation.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavHostController

data class BottomNavItem(
    val label: String,
    val icon: ImageVector,
    val screen: Screen
)

val bottomNavItems = listOf(
    BottomNavItem("Accueil", Icons.Default.Home, Screen.Home),
    BottomNavItem("Carte", Icons.Default.Map, Screen.Map),
    BottomNavItem("Trajets", Icons.Default.DirectionsCar, Screen.Rides),
    BottomNavItem("Chat", Icons.Default.Chat, Screen.Chat),
    BottomNavItem("Profil", Icons.Default.Person, Screen.Profile)
)

@Composable
fun RideMadaBottomBar(
    navController: NavHostController,
    currentRoute: String
) {
    NavigationBar(
        containerColor = MaterialTheme.colorScheme.surface,
        tonalElevation = 8.dp
    ) {
        bottomNavItems.forEach { item ->
            NavigationBarItem(
                selected = currentRoute == item.screen.route,
                onClick = {
                    navController.navigate(item.screen.route) {
                        popUpTo(navController.graph.startDestinationId) {
                            saveState = true
                        }
                        launchSingleTop = true
                        restoreState = true
                    }
                },
                icon = { Icon(item.icon, contentDescription = item.label) },
                label = { Text(item.label) },
                alwaysShowLabel = true
            )
        }
    }
}