package com.ridemada.presentation.screens.auth

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.scaleIn
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import com.ridemada.presentation.navigation.RoleNavigation
import com.ridemada.presentation.navigation.Screen
import com.ridemada.presentation.viewmodel.AuthViewModel
import com.ridemada.ui.theme.CyanPrimary
import com.ridemada.ui.theme.DarkBackground
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(
    navController: NavHostController,
    viewModel: AuthViewModel = hiltViewModel(),
) {
    var startAnimation by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        startAnimation = true
        delay(2000)
        viewModel.checkSession { loggedIn, role ->
            val destination = if (loggedIn) RoleNavigation.homeForRole(role) else Screen.Login.route
            navController.navigate(destination) {
                popUpTo(Screen.Splash.route) { inclusive = true }
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(DarkBackground, Color(0xFF001525))
                )
            ),
        contentAlignment = Alignment.Center,
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            AnimatedVisibility(
                visible = startAnimation,
                enter = scaleIn(animationSpec = tween(1000)) + fadeIn(animationSpec = tween(1000))
            ) {
                Text(
                    text = "RideMada",
                    fontSize = 56.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = CyanPrimary,
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
            AnimatedVisibility(
                visible = startAnimation,
                enter = fadeIn(animationSpec = tween(1500, delayMillis = 500))
            ) {
                Text(
                    text = "La mobilité repensée à Madagascar",
                    color = Color.LightGray,
                    fontSize = 16.sp,
                    style = MaterialTheme.typography.bodyLarge
                )
            }
        }
        CircularProgressIndicator(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 64.dp),
            color = CyanPrimary,
            strokeWidth = 3.dp
        )
    }
}
