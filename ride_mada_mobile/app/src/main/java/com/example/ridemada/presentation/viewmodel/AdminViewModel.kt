package com.ridemada.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ridemada.data.remote.dto.*
import com.ridemada.domain.repository.AdminRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class AdminUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val stats: AdminStatsDto? = null,
    val users: List<AdminUserDto> = emptyList(),
    val pendingDrivers: List<PendingDriverDto> = emptyList(),
    val activeRides: List<RideDto> = emptyList(),
    val reports: List<ReportDto> = emptyList(),
    val actionMessage: String? = null,
)

@HiltViewModel
class AdminViewModel @Inject constructor(
    private val adminRepository: AdminRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(AdminUiState())
    val state = _state.asStateFlow()

    fun loadDashboard() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null)
            adminRepository.getStatistics()
                .onSuccess { stats -> _state.value = _state.value.copy(stats = stats, isLoading = false) }
                .onFailure { e -> _state.value = _state.value.copy(error = e.message, isLoading = false) }
        }
    }

    fun loadUsers() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true)
            adminRepository.getUsers()
                .onSuccess { users -> _state.value = _state.value.copy(users = users, isLoading = false) }
                .onFailure { e -> _state.value = _state.value.copy(error = e.message, isLoading = false) }
        }
    }

    fun loadPendingDrivers() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true)
            adminRepository.getPendingDrivers()
                .onSuccess { drivers -> _state.value = _state.value.copy(pendingDrivers = drivers, isLoading = false) }
                .onFailure { e -> _state.value = _state.value.copy(error = e.message, isLoading = false) }
        }
    }

    fun loadActiveRides() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true)
            adminRepository.getActiveRides()
                .onSuccess { rides -> _state.value = _state.value.copy(activeRides = rides, isLoading = false) }
                .onFailure { e -> _state.value = _state.value.copy(error = e.message, isLoading = false) }
        }
    }

    fun loadReports() {
        viewModelScope.launch {
            adminRepository.getReports()
                .onSuccess { reports -> _state.value = _state.value.copy(reports = reports) }
        }
    }

    fun approveDriver(driverId: String) {
        viewModelScope.launch {
            adminRepository.approveDriver(driverId)
                .onSuccess {
                    _state.value = _state.value.copy(actionMessage = "Conducteur approuvé")
                    loadPendingDrivers()
                    loadDashboard()
                }
                .onFailure { e -> _state.value = _state.value.copy(error = e.message) }
        }
    }

    fun toggleBlockUser(userId: String, currentlyBlocked: Boolean) {
        viewModelScope.launch {
            val result = if (currentlyBlocked) adminRepository.unblockUser(userId)
            else adminRepository.blockUser(userId)
            result.onSuccess {
                _state.value = _state.value.copy(
                    actionMessage = if (currentlyBlocked) "Utilisateur débloqué" else "Utilisateur bloqué",
                )
                loadUsers()
            }.onFailure { e -> _state.value = _state.value.copy(error = e.message) }
        }
    }

    fun clearActionMessage() {
        _state.value = _state.value.copy(actionMessage = null)
    }
}
