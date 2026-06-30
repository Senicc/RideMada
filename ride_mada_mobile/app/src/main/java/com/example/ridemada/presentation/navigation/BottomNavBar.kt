package com.ridemada.presentation.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController

data class BottomNavItem(
    val label: String,
    val icon: ImageVector,
    val screen: Screen,
)

// Menu Passager
val passengerNavItems = listOf(
    BottomNavItem("Accueil", Icons.Default.Home, Screen.Home),
    BottomNavItem("Carte", Icons.Default.Map, Screen.Map),
    BottomNavItem("Trajets", Icons.Default.DirectionsCar, Screen.Rides),
    BottomNavItem("Activité", Icons.Default.Receipt, Screen.Bookings),
    BottomNavItem("Compte", Icons.Default.Person, Screen.Profile),
)

// Menu Conducteur
val driverNavItems = listOf(
    BottomNavItem("Conduire", Icons.Default.Dashboard, Screen.DriverDashboard),
    BottomNavItem("Courses", Icons.Default.DirectionsCar, Screen.DriverRides),
    BottomNavItem("Carte", Icons.Default.Map, Screen.Map),
    BottomNavItem("Gains", Icons.Default.AttachMoney, Screen.DriverEarnings),
    BottomNavItem("Compte", Icons.Default.Person, Screen.Profile),
)

// Menu Admin
val adminNavItems = listOf(
    BottomNavItem("Stats", Icons.Default.Dashboard, Screen.AdminDashboard),
    BottomNavItem("Users", Icons.Default.Group, Screen.AdminUsers),
    BottomNavItem("Chauffeurs", Icons.Default.Badge, Screen.AdminDrivers),
    BottomNavItem("Courses", Icons.Default.LocalTaxi, Screen.AdminRides),
    BottomNavItem("Compte", Icons.Default.Person, Screen.Profile),
)

@Composable
fun RideMadaBottomBar(
    navController: NavHostController,
    currentRoute: String,
    userRole: String?
) {
    val items = when (userRole) {
        "ADMIN" -> adminNavItems
        "DRIVER" -> driverNavItems
        else -> passengerNavItems
    }

    NavigationBar(
        containerColor = MaterialTheme.colorScheme.surface,
        tonalElevation = 4.dp,
    ) {
        items.forEach { item ->
            NavigationBarItem(
                selected = currentRoute == item.screen.route,
                onClick = {
                    navController.navigate(item.screen.route) {
                        popUpTo(items.first().screen.route) { saveState = true }
                        launchSingleTop = true
                        restoreState = true
                    }
                },
                icon = { Icon(item.icon, contentDescription = item.label) },
                label = { Text(item.label, style = MaterialTheme.typography.labelSmall) },
                alwaysShowLabel = false,
                colors = NavigationBarItemDefaults.colors(
                    indicatorColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.15f),
                    selectedIconColor = MaterialTheme.colorScheme.primary,
                    selectedTextColor = MaterialTheme.colorScheme.primary,
                    unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                    unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            )
        }
    }
}
