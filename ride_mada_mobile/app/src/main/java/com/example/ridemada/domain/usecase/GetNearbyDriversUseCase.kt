package com.ridemada.domain.usecase

import com.ridemada.domain.model.DriverLocation
import com.ridemada.domain.repository.MapRepository
import javax.inject.Inject

class GetNearbyDriversUseCase @Inject constructor(
    private val mapRepository: MapRepository,
) {
    suspend operator fun invoke(lat: Double, lng: Double): List<DriverLocation> =
        mapRepository.getNearbyDrivers(lat, lng)
}
