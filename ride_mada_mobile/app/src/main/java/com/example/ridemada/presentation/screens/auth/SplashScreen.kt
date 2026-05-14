@Composable
fun SplashScreen(navController: NavHostController) {
    var startAnimation by remember { mutableStateOf(false) }

    LaunchedEffect(key1 = true) {
        startAnimation = true
        delay(2800)
        navController.navigate(Screen.Login.route) {
            popUpTo(Screen.Splash.route) { inclusive = true }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            // Logo animé
            AnimatedVisibility(visible = startAnimation) {
                Text(
                    text = "RideMada",
                    fontSize = 52.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary,
                    style = MaterialTheme.typography.headlineLarge
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "Covoiturage Madagascar",
                color = Color.Gray,
                fontSize = 16.sp
            )
        }

        CircularProgressIndicator(
            modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 64.dp),
            color = MaterialTheme.colorScheme.primary
        )
    }
}