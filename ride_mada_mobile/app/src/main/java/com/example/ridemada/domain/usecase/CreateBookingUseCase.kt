package com.ridemada.domain.usecase

import com.ridemada.data.remote.RideMadaApi
import com.ridemada.data.remote.dto.BookingRequest
import javax.inject.Inject

class CreateBookingUseCase @Inject constructor(
    private val api: RideMadaApi,
) {
    suspend operator fun invoke(rideId: String, seats: Int = 1): Boolean {
        val response = api.createBooking(BookingRequest(rideId, seats))
        return response.isSuccessful && response.body()?.success == true
    }
}
