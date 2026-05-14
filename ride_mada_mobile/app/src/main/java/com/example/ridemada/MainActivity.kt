package com.ridemada

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import com.ridemada.presentation.navigation.RideMadaNavHost
import com.ridemada.ui.theme.RideMadaTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            RideMadaTheme {
                val navController = rememberNavController()
                val currentBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = currentBackStackEntry?.destination?.route

                Surface(modifier = Modifier.fillMaxSize()) {
                    Scaffold(
                        bottomBar = {
                            if (currentRoute in listOf(
                                    Screen.Home.route,
                                    Screen.Map.route,
                                    Screen.Rides.route,
                                    Screen.Chat.route,
                                    Screen.Profile.route
                                )) {
                                RideMadaBottomBar(navController, currentRoute.orEmpty())
                            }
                        }
                    ) { padding ->
                        RideMadaNavHost(
                            navController = navController,
                            modifier = Modifier.padding(padding)
                        )
                    }
                }
            }
        }
    }
}