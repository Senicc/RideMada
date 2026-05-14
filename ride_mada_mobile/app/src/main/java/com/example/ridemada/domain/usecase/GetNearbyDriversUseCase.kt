package com.ridemada.domain.usecase

import com.ridemada.domain.model.DriverLocation
import com.ridemada.domain.repository.MapRepositoryImpl
import javax.inject.Inject

class GetNearbyDriversUseCase @Inject constructor(
    private val mapRepository: MapRepositoryImpl
) {
    suspend operator fun invoke(lat: Double, lng: Double, radius: Double = 10.0): List<DriverLocation> {
        return mapRepository.getNearbyDrivers(lat, lng, radius)
    }
}