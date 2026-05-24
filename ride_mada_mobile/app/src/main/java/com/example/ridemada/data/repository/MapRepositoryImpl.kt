package com.ridemada.data.repository

import com.ridemada.data.local.dao.RideDao
import com.ridemada.data.local.entity.RideEntity
import com.ridemada.data.remote.RideMadaApi
import com.ridemada.data.remote.dto.RideDto
import com.ridemada.domain.model.DriverLocation
import com.ridemada.domain.model.Ride
import com.ridemada.domain.repository.MapRepository
import com.ridemada.services.SocketService
import java.time.Instant
import javax.inject.Inject
import kotlinx.coroutines.flow.first

class MapRepositoryImpl @Inject constructor(
    private val api: RideMadaApi,
    private val socketService: SocketService,
    private val rideDao: RideDao,
) : MapRepository {

    override suspend fun getNearbyDrivers(lat: Double, lng: Double, radius: Double): List<DriverLocation> {
        val response = api.getNearbyDrivers(lat, lng)
        if (!response.isSuccessful) return emptyList()
        return response.body()?.drivers?.mapNotNull { driver ->
            val user = driver.user ?: return@mapNotNull null
            val driverLat = driver.currentLat ?: return@mapNotNull null
            val driverLng = driver.currentLng ?: return@mapNotNull null
            DriverLocation(
                id = driver.id,
                name = user.name,
                lat = driverLat,
                lng = driverLng,
                rating = driver.rating,
            )
        } ?: emptyList()
    }

    override suspend fun getNearbyRides(lat: Double, lng: Double): List<Ride> {
        val response = api.getNearbyRides(lat, lng)
        if (!response.isSuccessful) {
            return rideDao.getAvailableRides(System.currentTimeMillis())
                .first()
                .map { it.toDomain() }
        }
        val rides = response.body()?.rides?.map { it.toDomain() } ?: emptyList()
        rideDao.insertRides(rides.map { it.toEntity() })
        return rides
    }

    override suspend fun updateMyLocation(lat: Double, lng: Double) {
        socketService.updateLocation(lat, lng)
    }

    private fun RideDto.toDomain(): Ride = Ride(
        id = id,
        driverName = driver?.user?.name ?: "Conducteur",
        departureAddress = departureAddress,
        arrivalAddress = arrivalAddress,
        departureLat = departureLat,
        departureLng = departureLng,
        arrivalLat = arrivalLat,
        arrivalLng = arrivalLng,
        price = price,
        availableSeats = availableSeats,
        departureTime = runCatching { Instant.parse(departureTime).toEpochMilli() }
            .getOrDefault(System.currentTimeMillis()),
        status = status,
    )

    private fun Ride.toEntity(): RideEntity = RideEntity(
        id = id,
        driverId = "",
        departureAddress = departureAddress,
        arrivalAddress = arrivalAddress,
        departureLat = departureLat,
        departureLng = departureLng,
        arrivalLat = arrivalLat,
        arrivalLng = arrivalLng,
        price = price,
        availableSeats = availableSeats,
        departureTime = departureTime,
        status = status,
    )

    private fun RideEntity.toDomain(): Ride = Ride(
        id = id,
        driverName = "Conducteur",
        departureAddress = departureAddress,
        arrivalAddress = arrivalAddress,
        departureLat = departureLat,
        departureLng = departureLng,
        arrivalLat = arrivalLat,
        arrivalLng = arrivalLng,
        price = price,
        availableSeats = availableSeats,
        departureTime = departureTime,
        status = status,
    )
}
