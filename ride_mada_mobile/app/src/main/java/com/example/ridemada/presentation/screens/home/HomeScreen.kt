package com.ridemada.presentation.screens.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import com.ridemada.presentation.navigation.Screen
import com.ridemada.presentation.viewmodel.ProfileViewModel
import com.ridemada.ui.theme.BrandAccent
import com.ridemada.ui.theme.GreenAccent
import com.ridemada.ui.theme.SkyBlue400
import com.ridemada.ui.theme.SkyBlue600
import com.ridemada.ui.theme.SkyBlue100
import com.ridemada.ui.theme.WarningGold

@Composable
fun HomeScreen(
    navController: NavHostController,
    profileViewModel: ProfileViewModel = hiltViewModel(),
) {
    val user by profileViewModel.user.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(rememberScrollState())
    ) {

        // ── Hero Header with gradient ──────────────────────────────────────
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    brush = Brush.verticalGradient(
                        colors = listOf(SkyBlue600, SkyBlue400)
                    )
                )
                .padding(horizontal = 24.dp, vertical = 36.dp)
        ) {
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Column {
                        Text(
                            text = "Bonjour${user?.name?.let { ", ${it.split(" ").first()}" } ?: ""} 👋",
                            style = MaterialTheme.typography.bodyLarge,
                            color = Color.White.copy(alpha = 0.85f),
                            fontWeight = FontWeight.Medium,
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Où allez-vous ?",
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.Black,
                            color = Color.White,
                            letterSpacing = (-0.5).sp,
                        )
                    }
                    Box(
                        modifier = Modifier
                            .size(46.dp)
                            .clip(CircleShape)
                            .background(Color.White.copy(alpha = 0.2f))
                            .clickable { navController.navigate(Screen.Profile.route) },
                        contentAlignment = Alignment.Center,
                    ) {
                        Icon(
                            imageVector = Icons.Default.Person,
                            contentDescription = "Profil",
                            tint = Color.White,
                            modifier = Modifier.size(24.dp),
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // ── Embedded Search Bar ──────────────────────────────────
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(8.dp, RoundedCornerShape(16.dp))
                        .clickable { navController.navigate(Screen.Map.route) },
                    shape = RoundedCornerShape(16.dp),
                    color = Color.White,
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Icon(
                            imageVector = Icons.Default.Search,
                            contentDescription = "Rechercher",
                            tint = SkyBlue400,
                            modifier = Modifier.size(22.dp),
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = "Entrez votre destination...",
                            style = MaterialTheme.typography.bodyLarge,
                            color = Color(0xFFB0C4D8),
                            fontWeight = FontWeight.Medium,
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // ── Quick Actions ──────────────────────────────────────────────────
        Text(
            text = "Actions rapides",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onBackground,
            modifier = Modifier.padding(horizontal = 24.dp),
        )
        Spacer(modifier = Modifier.height(16.dp))

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp),
            horizontalArrangement = Arrangement.SpaceEvenly,
        ) {
            QuickActionItem(
                icon = Icons.Default.DirectionsCar,
                label = "Trajet",
                gradient = listOf(SkyBlue400, SkyBlue600),
                onClick = { navController.navigate(Screen.Map.route) }
            )
            QuickActionItem(
                icon = Icons.Default.Schedule,
                label = "Planifier",
                gradient = listOf(Color(0xFF6366F1), Color(0xFF8B5CF6)),
                onClick = { navController.navigate(Screen.Rides.route) }
            )
            QuickActionItem(
                icon = Icons.Default.History,
                label = "Historique",
                gradient = listOf(Color(0xFFF59E0B), Color(0xFFEF8C00)),
                onClick = { navController.navigate(Screen.Bookings.route) }
            )
            QuickActionItem(
                icon = Icons.Default.Badge,
                label = "Devenir Pilote",
                gradient = listOf(GreenAccent, Color(0xFF00A070)),
                onClick = { navController.navigate(Screen.BecomeDriver.route) }
            )
        }

        Spacer(modifier = Modifier.height(32.dp))

        // ── Promo Card ────────────────────────────────────────────────────
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = SkyBlue100),
        ) {
            Row(
                modifier = Modifier.padding(20.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "🎉 Votre première course",
                        style = MaterialTheme.typography.labelLarge,
                        color = SkyBlue600,
                        fontWeight = FontWeight.Bold,
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Profitez de -20% sur votre prochain trajet avec RideMada",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = SkyBlue400,
                        modifier = Modifier.clickable { navController.navigate(Screen.Map.route) }
                    ) {
                        Text(
                            text = "Commander →",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                        )
                    }
                }
                Spacer(modifier = Modifier.width(12.dp))
                Box(
                    modifier = Modifier
                        .size(64.dp)
                        .clip(CircleShape)
                        .background(SkyBlue400.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(Icons.Default.LocalOffer, contentDescription = null, tint = SkyBlue400, modifier = Modifier.size(32.dp))
                }
            }
        }

        Spacer(modifier = Modifier.height(28.dp))
        HorizontalDivider(
            modifier = Modifier.padding(horizontal = 24.dp),
            thickness = 1.dp,
            color = MaterialTheme.colorScheme.outline,
        )
        Spacer(modifier = Modifier.height(24.dp))

        // ── Recent Destinations ────────────────────────────────────────────
        Text(
            text = "Destinations récentes",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 24.dp),
        )
        Spacer(modifier = Modifier.height(8.dp))

        RecentDestinationItem("Aéroport d'Ivato", "Antananarivo") { navController.navigate(Screen.Map.route) }
        RecentDestinationItem("Analakely", "Avenue de l'Indépendance") { navController.navigate(Screen.Map.route) }
        RecentDestinationItem("Ankorondrano", "Zone Galaxy") { navController.navigate(Screen.Map.route) }

        Spacer(modifier = Modifier.height(100.dp))
    }
}

@Composable
fun QuickActionItem(
    icon: ImageVector,
    label: String,
    gradient: List<Color>,
    onClick: () -> Unit,
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.clickable { onClick() }
    ) {
        Box(
            modifier = Modifier
                .size(60.dp)
                .clip(RoundedCornerShape(18.dp))
                .background(Brush.verticalGradient(gradient)),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                imageVector = icon,
                contentDescription = label,
                tint = Color.White,
                modifier = Modifier.size(26.dp),
            )
        }
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.SemiBold,
            color = MaterialTheme.colorScheme.onBackground,
        )
    }
}

@Composable
fun RecentDestinationItem(title: String, subtitle: String, onClick: () -> Unit = {}) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 24.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier
                .size(44.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(MaterialTheme.colorScheme.surfaceVariant),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                imageVector = Icons.Default.Place,
                contentDescription = null,
                tint = BrandAccent,
                modifier = Modifier.size(22.dp),
            )
        }
        Spacer(modifier = Modifier.width(16.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onBackground,
            )
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        Icon(
            imageVector = Icons.Default.NorthEast,
            contentDescription = null,
            tint = BrandAccent,
            modifier = Modifier.size(18.dp),
        )
    }
}
