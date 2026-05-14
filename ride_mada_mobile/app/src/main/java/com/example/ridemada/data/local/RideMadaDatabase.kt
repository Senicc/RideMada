package com.ridemada.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.ridemada.data.local.dao.RideDao
import com.ridemada.data.local.entity.RideEntity
import com.ridemada.data.local.entity.UserEntity

@Database(
    entities = [RideEntity::class, UserEntity::class],
    version = 1,
    exportSchema = false
)
abstract class RideMadaDatabase : RoomDatabase() {

    abstract fun rideDao(): RideDao

    // abstract fun userDao(): UserDao
}