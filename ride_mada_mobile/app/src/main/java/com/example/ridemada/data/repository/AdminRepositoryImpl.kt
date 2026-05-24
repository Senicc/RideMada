package com.ridemada.data.repository

import com.ridemada.data.remote.RideMadaApi
import com.ridemada.data.remote.dto.*
import com.ridemada.domain.repository.AdminRepository
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AdminRepositoryImpl @Inject constructor(
    private val api: RideMadaApi,
) : AdminRepository {

    private fun <T> unwrap(response: retrofit2.Response<T>, block: (T) -> Unit): Result<Unit> {
        val body = response.body()
        return if (response.isSuccessful && body != null) {
            block(body)
            Result.success(Unit)
        } else {
            Result.failure(Exception(response.message()))
        }
    }

    override suspend fun getStatistics(): Result<AdminStatsDto> = runCatching {
        val response = api.getAdminStatistics()
        val body = response.body() ?: throw Exception(response.message())
        body.stats ?: throw Exception("Statistiques indisponibles")
    }

    override suspend fun getUsers(): Result<List<AdminUserDto>> = runCatching {
        api.getAdminUsers().body()?.users ?: emptyList()
    }

    override suspend fun getPendingDrivers(): Result<List<PendingDriverDto>> = runCatching {
        api.getPendingDrivers().body()?.drivers ?: emptyList()
    }

    override suspend fun approveDriver(driverId: String): Result<Unit> = runCatching {
        val response = api.approveDriver(driverId)
        if (!response.isSuccessful) throw Exception(response.message())
    }

    override suspend fun getActiveRides(): Result<List<RideDto>> = runCatching {
        api.getActiveRides().body()?.rides ?: emptyList()
    }

    override suspend fun getReports(): Result<List<ReportDto>> = runCatching {
        api.getReports().body()?.reports ?: emptyList()
    }

    override suspend fun blockUser(userId: String): Result<Unit> = runCatching {
        val response = api.blockUser(userId)
        if (!response.isSuccessful) throw Exception(response.message())
    }

    override suspend fun unblockUser(userId: String): Result<Unit> = runCatching {
        val response = api.unblockUser(userId)
        if (!response.isSuccessful) throw Exception(response.message())
    }
}
