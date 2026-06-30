package com.ridemada.presentation.screens.auth

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DirectionsCar
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Security
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import com.ridemada.data.local.AppPreferences
import com.ridemada.presentation.components.RideMadaButton
import com.ridemada.presentation.navigation.Screen
import com.ridemada.ui.theme.BrandAccent
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

data class OnboardingPage(val title: String, val subtitle: String, val icon: ImageVector)

private val pages = listOf(
    OnboardingPage("Déplacez-vous facilement", "Commandez une course ou réservez un trajet partagé en quelques secondes.", Icons.Default.LocationOn),
    OnboardingPage("Conducteurs de confiance", "Suivez votre chauffeur en temps réel et payez en toute sécurité.", Icons.Default.DirectionsCar),
    OnboardingPage("Sécurité avant tout", "Signalez un problème, contactez le support et voyagez sereinement.", Icons.Default.Security),
)

@HiltViewModel
class OnboardingViewModel @Inject constructor(
    private val appPreferences: AppPreferences,
) : androidx.lifecycle.ViewModel() {
    suspend fun completeOnboarding() = appPreferences.setOnboardingCompleted()
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun OnboardingScreen(
    navController: NavHostController,
    viewModel: OnboardingViewModel = hiltViewModel(),
) {
    val pagerState = rememberPagerState(pageCount = { pages.size })
    val scope = rememberCoroutineScope()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Spacer(modifier = Modifier.height(48.dp))
        Text("RideMada", fontSize = 28.sp, fontWeight = FontWeight.Black, color = BrandAccent)
        Spacer(modifier = Modifier.height(32.dp))

        HorizontalPager(state = pagerState, modifier = Modifier.weight(1f)) { page ->
            val item = pages[page]
            Column(
                modifier = Modifier.fillMaxSize(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
            ) {
                Box(
                    modifier = Modifier
                        .size(120.dp)
                        .background(BrandAccent.copy(alpha = 0.12f), CircleShape),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(item.icon, contentDescription = null, tint = BrandAccent, modifier = Modifier.size(56.dp))
                }
                Spacer(modifier = Modifier.height(32.dp))
                Text(item.title, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                Spacer(modifier = Modifier.height(12.dp))
                Text(item.subtitle, style = MaterialTheme.typography.bodyLarge, color = MaterialTheme.colorScheme.onSurfaceVariant, textAlign = TextAlign.Center)
            }
        }

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            repeat(pages.size) { index ->
                Box(
                    modifier = Modifier
                        .size(if (pagerState.currentPage == index) 10.dp else 8.dp)
                        .background(
                            if (pagerState.currentPage == index) BrandAccent else MaterialTheme.colorScheme.outline,
                            CircleShape,
                        ),
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        RideMadaButton(
            text = if (pagerState.currentPage == pages.lastIndex) "Commencer" else "Suivant",
            onClick = {
                if (pagerState.currentPage < pages.lastIndex) {
                    scope.launch { pagerState.animateScrollToPage(pagerState.currentPage + 1) }
                } else {
                    scope.launch {
                        viewModel.completeOnboarding()
                        navController.navigate(Screen.Login.route) {
                            popUpTo(Screen.Onboarding.route) { inclusive = true }
                        }
                    }
                }
            },
        )

        if (pagerState.currentPage < pages.lastIndex) {
            TextButton(onClick = {
                scope.launch {
                    viewModel.completeOnboarding()
                    navController.navigate(Screen.Login.route) {
                        popUpTo(Screen.Onboarding.route) { inclusive = true }
                    }
                }
            }) {
                Text("Passer")
            }
        }
    }
}
