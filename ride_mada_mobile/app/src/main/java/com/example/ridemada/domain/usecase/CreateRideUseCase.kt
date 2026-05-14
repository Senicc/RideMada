package com.ridemada.domain.usecase

class CreateRideUseCase @Inject constructor(
    private val rideRepository: RideRepository
) {
    suspend operator fun invoke(
        departureLat: Double,
        departureLng: Double,
        arrivalLat: Double,
        arrivalLng: Double,
        price: Double,
        seats: Int
    ) = rideRepository.createRide(...)
}