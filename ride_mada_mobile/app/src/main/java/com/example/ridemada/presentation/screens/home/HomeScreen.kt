package com.ridemada.presentation.screens.home

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import com.ridemada.presentation.navigation.Screen

@Composable
fun HomeScreen(navController: NavHostController) {
    val navItems = listOf(
        BottomNavItem("Accueil", Icons.Default.Home, Screen.Home),
        BottomNavItem("Carte", Icons.Default.Map, Screen.Map),
        BottomNavItem("Trajets", Icons.Default.DirectionsCar, Screen.Rides),
        BottomNavItem("Profil", Icons.Default.Person, Screen.Profile)
    )

    var currentRoute by remember { mutableStateOf(Screen.Home.route) }

    Scaffold(
        bottomBar = {
            NavigationBar {
                navItems.forEach { item ->
                    NavigationBarItem(
                        selected = currentRoute == item.screen.route,
                        onClick = {
                            currentRoute = item.screen.route
                            navController.navigate(item.screen.route) {
                                popUpTo(navController.graph.startDestinationId)
                                launchSingleTop = true
                            }
                        },
                        icon = { Icon(item.icon, contentDescription = item.title) },
                        label = { Text(item.title) }
                    )
                }
            }
        }
    ) { paddingValues ->
        Box(modifier = Modifier.padding(paddingValues)) {
            when (currentRoute) {
                Screen.Home.route -> HomeContent()
                Screen.Map.route -> MapScreen(navController)
                // Autres écrans...
            }
        }
    }
}