package com.ridemada.di

import android.content.Context
import com.ridemada.data.remote.RideMadaApi
import com.ridemada.data.repository.AuthRepositoryImpl
import com.ridemada.data.repository.MapRepositoryImpl
import com.ridemada.domain.repository.AuthRepository
import com.ridemada.domain.repository.MapRepositoryImpl
import com.ridemada.services.LocationService
import com.ridemada.services.SocketService
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideOkHttpClient(): OkHttpClient {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        return OkHttpClient.Builder()
            .addInterceptor(logging)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    @Provides
    @Singleton
    fun provideRideMadaApi(okHttpClient: OkHttpClient): RideMadaApi {
        return Retrofit.Builder()
            .baseUrl("http://10.0.2.2:5000/api/") // Change en production
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(RideMadaApi::class.java)
    }

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): RideMadaDatabase {
        return Room.databaseBuilder(
            context,
            RideMadaDatabase::class.java,
            "ridemada_db"
        ).fallbackToDestructiveMigration()
            .build()
    }

    @Provides
    @Singleton
    fun provideNetworkObserver(@ApplicationContext context: Context): NetworkConnectivityObserver {
        return NetworkConnectivityObserverImpl(context)
    }

    @Provides
    @Singleton
    fun provideSyncManager(
        networkObserver: NetworkConnectivityObserver,
        mapRepository: MapRepository,
        rideDao: RideDao,
        api: RideMadaApi
    ): SyncManager {
        return SyncManager(networkObserver, mapRepository, rideDao, api)
    }

    @Provides
    @Singleton
    fun provideRideDao(database: RideMadaDatabase): RideDao = database.rideDao()

    @Provides
    @Singleton
    fun provideAuthRepository(api: RideMadaApi): AuthRepository =
        AuthRepositoryImpl(api)

    @Provides
    @Singleton
    fun provideMapRepository(api: RideMadaApi, socketService: SocketService): com.ridemada.domain.repository.MapRepositoryImpl =
        MapRepositoryImpl(api, socketService)

    @Provides
    @Singleton
    fun provideSocketService(): SocketService = SocketService()

    @Provides
    @Singleton
    fun provideLocationService(@ApplicationContext context: Context): LocationService =
        LocationService(context)
}