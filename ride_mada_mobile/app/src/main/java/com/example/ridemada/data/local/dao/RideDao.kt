package com.ridemada.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.ridemada.data.local.entity.RideEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface RideDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRides(rides: List<RideEntity>)

    @Query("SELECT * FROM rides WHERE departureTime > :currentTime ORDER BY departureTime ASC")
    fun getAvailableRides(currentTime: Long): Flow<List<RideEntity>>

    @Query("DELETE FROM rides")
    suspend fun deleteAllRides()

    @Query("SELECT * FROM rides WHERE id = :rideId")
    suspend fun getRideById(rideId: String): RideEntity?
}