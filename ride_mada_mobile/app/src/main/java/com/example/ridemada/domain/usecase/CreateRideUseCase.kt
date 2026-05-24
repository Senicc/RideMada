package com.ridemada.domain.usecase

import com.ridemada.data.remote.RideMadaApi
import com.ridemada.data.remote.dto.CreateRideRequest
import javax.inject.Inject

class CreateRideUseCase @Inject constructor(
    private val api: RideMadaApi,
) {
    suspend operator fun invoke(request: CreateRideRequest): Boolean {
        val response = api.createRide(request)
        return response.isSuccessful && response.body()?.success == true
    }
}
