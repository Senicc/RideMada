package com.ridemada.presentation.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.ridemada.presentation.screens.auth.LoginScreen
import com.ridemada.presentation.screens.auth.RegisterScreen
import com.ridemada.presentation.screens.auth.SplashScreen
import com.ridemada.presentation.screens.booking.BookingScreen
import com.ridemada.presentation.screens.chat.ChatScreen
import com.ridemada.presentation.screens.driver.BecomeDriverScreen
import com.ridemada.presentation.screens.home.HomeScreen
import com.ridemada.presentation.screens.map.MapScreen
import com.ridemada.presentation.screens.profile.ProfileScreen
import com.ridemada.presentation.screens.ride.CreateRideScreen

sealed class Screen(val route: String) {
    data object Splash : Screen("splash_screen")
    data object Login : Screen("login_screen")
    data object Register : Screen("register_screen")
    data object Home : Screen("home_screen")
    data object Map : Screen("map_screen")
    data object Rides : Screen("rides_screen")
    data object CreateRide : Screen("create_ride_screen")
    data object Booking : Screen("booking_screen")
    data object Chat : Screen("chat_screen")
    data object Profile : Screen("profile_screen")
    data object BecomeDriver : Screen("become_driver_screen")
}

@Composable
fun RideMadaNavHost(
    navController: NavHostController,
    modifier: Modifier = Modifier,
    startDestination: String = Screen.Splash.route
) {
    NavHost(
        navController = navController,
        startDestination = startDestination,
        modifier = modifier
    ) {
        composable(Screen.Splash.route) {
            SplashScreen(navController = navController)
        }

        composable(Screen.Login.route) {
            LoginScreen(navController = navController)
        }

        composable(Screen.Register.route) {
            RegisterScreen(navController = navController)
        }

        composable(Screen.Home.route) {
            HomeScreen(navController = navController)
        }

        composable(Screen.Map.route) {
            MapScreen(navController = navController)
        }

        composable(Screen.CreateRide.route) {
            CreateRideScreen(onRideCreated = {
                navController.popBackStack()
            })
        }

        composable(Screen.Booking.route) { backStackEntry ->
            val rideId = backStackEntry.arguments?.getString("rideId") ?: ""
            BookingScreen(rideId = rideId)
        }

        composable(Screen.Chat.route) {
            ChatScreen(rideId = "", receiverId = "") // Tu passeras les arguments plus tard
        }

        composable(Screen.Profile.route) {
            ProfileScreen(navController = navController)
        }

        composable(Screen.BecomeDriver.route) {
            BecomeDriverScreen(onSuccess = {
                navController.popBackStack()
            })
        }
    }
}