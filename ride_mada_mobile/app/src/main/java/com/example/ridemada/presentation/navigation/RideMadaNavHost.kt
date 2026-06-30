package com.ridemada.presentation.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.ridemada.presentation.screens.auth.*
import com.ridemada.presentation.screens.booking.BookingScreen
import com.ridemada.presentation.screens.booking.BookingsListScreen
import com.ridemada.presentation.screens.chat.ChatScreen
import com.ridemada.presentation.screens.driver.*
import com.ridemada.presentation.screens.admin.*
import com.ridemada.presentation.screens.home.HomeScreen
import com.ridemada.presentation.screens.map.MapScreen
import com.ridemada.presentation.screens.profile.*
import com.ridemada.presentation.screens.ride.CreateRideScreen
import com.ridemada.presentation.screens.ride.RidesListScreen
import com.ridemada.presentation.screens.trip.PaymentScreen
import com.ridemada.presentation.screens.trip.RatingScreen
import com.ridemada.presentation.screens.trip.TripTrackingScreen

sealed class Screen(val route: String) {
    // Auth
    data object Splash : Screen("splash_screen")
    data object Onboarding : Screen("onboarding_screen")
    data object Login : Screen("login_screen")
    data object Register : Screen("register_screen")
    data object Otp : Screen("otp_screen")
    data object ForgotPassword : Screen("forgot_password_screen")
    data object ResetPassword : Screen("reset_password_screen")
    
    // Shared
    data object Profile : Screen("profile_screen")
    data object EditProfile : Screen("edit_profile_screen")
    data object ChangePassword : Screen("change_password_screen")
    data object Wallet : Screen("wallet_screen")
    data object Help : Screen("help_screen")
    data object Settings : Screen("settings_screen")
    data object Favorites : Screen("favorites_screen")
    data object Report : Screen("report_screen")
    
    // Passenger
    data object Home : Screen("home_screen")
    data object Map : Screen("map_screen")
    data object Rides : Screen("rides_screen")
    data object Bookings : Screen("bookings_screen")
    data object BecomeDriver : Screen("become_driver_screen")
    data object Booking : Screen("booking_screen/{rideId}") {
        fun createRoute(rideId: String) = "booking_screen/$rideId"
    }
    data object Chat : Screen("chat_screen/{receiverId}/{rideId}") {
        fun createRoute(receiverId: String, rideId: String) = "chat_screen/$receiverId/$rideId"
    }
    
    // Driver
    data object DriverDashboard : Screen("driver_dashboard_screen")
    data object DriverRides : Screen("driver_rides_screen")
    data object DriverEarnings : Screen("driver_earnings_screen")
    data object CreateRide : Screen("create_ride_screen")
    data object MyVehicles : Screen("my_vehicles_screen")

    // Admin
    data object AdminDashboard : Screen("admin_dashboard_screen")
    data object AdminUsers : Screen("admin_users_screen")
    data object AdminDrivers : Screen("admin_drivers_screen")
    data object AdminRides : Screen("admin_rides_screen")

    // Trip flow
    data object TripTracking : Screen("trip_tracking/{rideRequestId}/{destination}/{price}") {
        fun createRoute(rideRequestId: String, destination: String, price: Int) =
            "trip_tracking/$rideRequestId/${destination.encodeForRoute()}/$price"
    }
    data object Payment : Screen("payment/{rideRequestId}/{amount}/{driverId}") {
        fun createRoute(rideRequestId: String, amount: Int, driverId: String) =
            "payment/$rideRequestId/$amount/$driverId"
    }
    data object Rating : Screen("rating/{driverId}") {
        fun createRoute(driverId: String) = "rating/$driverId"
    }
}

private fun String.encodeForRoute(): String = java.net.URLEncoder.encode(this, "UTF-8")

@Composable
fun RideMadaNavHost(
    navController: NavHostController,
    modifier: Modifier = Modifier,
    startDestination: String = Screen.Splash.route,
) {
    NavHost(navController, startDestination, modifier) {
        // --- AUTH ---
        composable(Screen.Splash.route) { SplashScreen(navController) }
        composable(Screen.Onboarding.route) { OnboardingScreen(navController) }
        composable(Screen.Login.route) { LoginScreen(navController) }
        composable(Screen.Register.route) { RegisterScreen(navController) }
        composable(Screen.ForgotPassword.route) { ForgotPasswordScreen(navController) }
        composable(
            route = "${Screen.ResetPassword.route}/{phone}",
            arguments = listOf(navArgument("phone") { type = NavType.StringType }),
        ) { entry ->
            ResetPasswordScreen(
                phone = entry.arguments?.getString("phone").orEmpty(),
                navController = navController,
            )
        }
        composable(
            route = "${Screen.Otp.route}/{phone}",
            arguments = listOf(navArgument("phone") { type = NavType.StringType }),
        ) { entry ->
            OtpScreen(phone = entry.arguments?.getString("phone").orEmpty(), navController)
        }

        // --- SHARED ---
        composable(Screen.Profile.route) { ProfileScreen(navController) }
        composable(Screen.EditProfile.route) { EditProfileScreen(navController) }
        composable(Screen.ChangePassword.route) { ChangePasswordScreen(navController) }
        composable(Screen.Wallet.route) { WalletScreen(navController) }
        composable(Screen.Help.route) { HelpScreen(navController) }
        composable(Screen.Settings.route) { SettingsScreen(navController) }
        composable(Screen.Favorites.route) { FavoritesScreen(navController) }
        composable(Screen.Report.route) { ReportScreen(navController) }
        composable(
            route = Screen.Chat.route,
            arguments = listOf(
                navArgument("receiverId") { type = NavType.StringType },
                navArgument("rideId") { type = NavType.StringType },
            ),
        ) { entry ->
            ChatScreen(
                receiverId = entry.arguments?.getString("receiverId").orEmpty(),
                rideId = entry.arguments?.getString("rideId").orEmpty(),
                navController = navController,
            )
        }

        // --- PASSENGER ---
        composable(Screen.Home.route) { HomeScreen(navController) }
        composable(Screen.Map.route) { MapScreen(navController) }
        composable(Screen.Rides.route) { RidesListScreen(navController) }
        composable(Screen.Bookings.route) { BookingsListScreen(navController) }
        composable(Screen.BecomeDriver.route) {
            BecomeDriverScreen(onSuccess = { navController.popBackStack() })
        }
        composable(
            route = Screen.Booking.route,
            arguments = listOf(navArgument("rideId") { type = NavType.StringType }),
        ) { entry ->
            BookingScreen(
                rideId = entry.arguments?.getString("rideId").orEmpty(),
                navController = navController,
            )
        }

        // --- DRIVER ---
        composable(Screen.DriverDashboard.route) { DriverHomeScreen(navController) }
        composable(Screen.DriverRides.route) { DriverRidesScreen(navController) }
        composable(Screen.DriverEarnings.route) { DriverEarningsScreen(navController) }
        composable(Screen.MyVehicles.route) { MyVehiclesScreen() }
        composable(Screen.CreateRide.route) {
            CreateRideScreen(onRideCreated = { navController.popBackStack() })
        }

        // --- ADMIN ---
        composable(Screen.AdminDashboard.route) { AdminDashboardScreen(navController) }
        composable(Screen.AdminUsers.route) { AdminUsersScreen(navController) }
        composable(Screen.AdminDrivers.route) { AdminDriversScreen(navController) }
        composable(Screen.AdminRides.route) { AdminRidesScreen(navController) }

        composable(
            route = Screen.TripTracking.route,
            arguments = listOf(
                navArgument("rideRequestId") { type = NavType.StringType },
                navArgument("destination") { type = NavType.StringType },
                navArgument("price") { type = NavType.IntType },
            ),
        ) { entry ->
            TripTrackingScreen(
                rideRequestId = entry.arguments?.getString("rideRequestId").orEmpty(),
                destination = java.net.URLDecoder.decode(
                    entry.arguments?.getString("destination").orEmpty(),
                    "UTF-8",
                ),
                price = entry.arguments?.getInt("price") ?: 0,
                navController = navController,
            )
        }
        composable(
            route = Screen.Payment.route,
            arguments = listOf(
                navArgument("rideRequestId") { type = NavType.StringType },
                navArgument("amount") { type = NavType.IntType },
                navArgument("driverId") { type = NavType.StringType },
            ),
        ) { entry ->
            PaymentScreen(
                rideRequestId = entry.arguments?.getString("rideRequestId").orEmpty(),
                amount = entry.arguments?.getInt("amount") ?: 0,
                driverId = entry.arguments?.getString("driverId").orEmpty(),
                navController = navController,
            )
        }
        composable(
            route = Screen.Rating.route,
            arguments = listOf(navArgument("driverId") { type = NavType.StringType }),
        ) { entry ->
            RatingScreen(
                driverId = entry.arguments?.getString("driverId").orEmpty(),
                navController = navController,
            )
        }
    }
}
