package com.ridemada

import android.Manifest
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.ridemada.presentation.components.ConnectionStatusBar
import com.ridemada.presentation.navigation.RideMadaBottomBar
import com.ridemada.presentation.navigation.RideMadaNavHost
import com.ridemada.presentation.navigation.Screen
import com.ridemada.presentation.viewmodel.MainViewModel
import com.ridemada.ui.theme.RideMadaTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            RideMadaTheme {
                val navController = rememberNavController()
                val mainViewModel: MainViewModel = hiltViewModel()
                val currentBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = currentBackStackEntry?.destination?.route

                val mainTabs = setOf(
                    Screen.Home.route,
                    Screen.Map.route,
                    Screen.Rides.route,
                    Screen.Bookings.route,
                    Screen.Profile.route,
                    Screen.DriverDashboard.route,
                    Screen.DriverRides.route,
                    Screen.DriverEarnings.route,
                    Screen.AdminDashboard.route,
                    Screen.AdminUsers.route,
                    Screen.AdminDrivers.route,
                    Screen.AdminRides.route,
                )
                val showBottomBar = currentRoute in mainTabs ||
                    currentRoute?.startsWith(Screen.Home.route) == true

                val notificationLauncher = rememberLauncherForActivityResult(
                    ActivityResultContracts.RequestPermission(),
                ) { }

                LaunchedEffect(Unit) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        notificationLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                    }
                    mainViewModel.syncFcmToken()
                }

                Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
                    Scaffold(
                        topBar = {
                            ConnectionStatusBar(networkObserver = mainViewModel.networkObserver)
                        },
                        bottomBar = {
                            if (showBottomBar) {
                                val userRole by mainViewModel.userRole.collectAsState()
                                RideMadaBottomBar(navController, currentRoute.orEmpty(), userRole)
                            }
                        },
                    ) { padding ->
                        RideMadaNavHost(
                            navController = navController,
                            modifier = Modifier.padding(padding),
                        )
                    }
                }
            }
        }
    }
}
