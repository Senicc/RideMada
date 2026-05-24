package com.ridemada.di

import android.content.Context
import androidx.room.Room
import com.google.gson.Gson
import com.ridemada.BuildConfig
import com.ridemada.data.local.RideMadaDatabase
import com.ridemada.data.local.SessionDataStore
import com.ridemada.data.local.dao.RideDao
import com.ridemada.data.local.TokenManager
import com.ridemada.data.remote.AuthInterceptor
import com.ridemada.data.remote.RideMadaApi
import com.ridemada.data.remote.TokenRefreshInterceptor
import com.ridemada.data.repository.AdminRepositoryImpl
import com.ridemada.data.repository.AuthRepositoryImpl
import com.ridemada.data.repository.MapRepositoryImpl
import com.ridemada.domain.repository.AdminRepository
import com.ridemada.data.sync.SyncManager
import com.ridemada.domain.repository.AuthRepository
import com.ridemada.domain.repository.MapRepository
import com.ridemada.services.LocationService
import com.ridemada.services.SocketService
import com.ridemada.utils.NetworkConnectivityObserver
import com.ridemada.utils.NetworkConnectivityObserverImpl
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
    fun provideGson(): Gson = Gson()

    @Provides
    @Singleton
    fun provideOkHttpClient(
        authInterceptor: AuthInterceptor,
        tokenRefreshInterceptor: TokenRefreshInterceptor,
    ): OkHttpClient {
        val logging = HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG) HttpLoggingInterceptor.Level.BASIC else HttpLoggingInterceptor.Level.NONE
        }
        return OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .addInterceptor(tokenRefreshInterceptor)
            .addInterceptor(logging)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    @Provides
    @Singleton
    fun provideRideMadaApi(okHttpClient: OkHttpClient): RideMadaApi {
        return Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(RideMadaApi::class.java)
    }

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): RideMadaDatabase {
        return Room.databaseBuilder(context, RideMadaDatabase::class.java, "ridemada_db")
            .fallbackToDestructiveMigration()
            .build()
    }

    @Provides
    @Singleton
    fun provideRideDao(database: RideMadaDatabase): RideDao = database.rideDao()

    @Provides
    @Singleton
    fun provideNetworkObserver(@ApplicationContext context: Context): NetworkConnectivityObserver {
        return NetworkConnectivityObserverImpl(context)
    }

    @Provides
    @Singleton
    fun provideAuthRepository(impl: AuthRepositoryImpl): AuthRepository = impl

    @Provides
    @Singleton
    fun provideMapRepository(impl: MapRepositoryImpl): MapRepository = impl

    @Provides
    @Singleton
    fun provideAdminRepository(impl: AdminRepositoryImpl): AdminRepository = impl

    @Provides
    @Singleton
    fun provideSyncManager(
        networkObserver: NetworkConnectivityObserver,
        mapRepository: MapRepository,
        rideDao: RideDao,
    ): SyncManager = SyncManager(networkObserver, mapRepository, rideDao)
}
