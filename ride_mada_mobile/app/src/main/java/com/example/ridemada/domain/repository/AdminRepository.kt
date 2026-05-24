package com.ridemada.domain.repository

import com.ridemada.data.remote.dto.*

interface AdminRepository {
    suspend fun getStatistics(): Result<AdminStatsDto>
    suspend fun getUsers(): Result<List<AdminUserDto>>
    suspend fun getPendingDrivers(): Result<List<PendingDriverDto>>
    suspend fun approveDriver(driverId: String): Result<Unit>
    suspend fun getActiveRides(): Result<List<RideDto>>
    suspend fun getReports(): Result<List<ReportDto>>
    suspend fun blockUser(userId: String): Result<Unit>
    suspend fun unblockUser(userId: String): Result<Unit>
}
