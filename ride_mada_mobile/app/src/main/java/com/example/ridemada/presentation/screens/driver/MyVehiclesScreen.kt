package com.ridemada.presentation.screens.driver

@Composable
fun MyVehiclesScreen(viewModel: DriverViewModel = hiltViewModel()) {
    LazyColumn(modifier = Modifier.fillMaxSize()) {
        items(viewModel.vehicles) { vehicle ->
            VehicleCard(vehicle = vehicle)
        }
    }
}