package com.ridemada.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ridemada.data.remote.RideMadaApi
import com.ridemada.data.remote.dto.ReviewRequest
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class RatingUiState(val isLoading: Boolean = false, val error: String? = null)

@HiltViewModel
class RatingViewModel @Inject constructor(
    private val api: RideMadaApi,
) : ViewModel() {

    private val _state = MutableStateFlow(RatingUiState())
    val state = _state.asStateFlow()

    fun submit(driverId: String, rating: Int, comment: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _state.value = RatingUiState(isLoading = true)
            runCatching {
                api.submitReview(ReviewRequest(reviewedId = driverId, rating = rating, comment = comment.takeIf { it.isNotBlank() }))
            }.onSuccess { response ->
                if (response.isSuccessful) {
                    _state.value = RatingUiState()
                    onSuccess()
                } else {
                    _state.value = RatingUiState(error = response.message())
                }
            }.onFailure { e ->
                _state.value = RatingUiState(error = e.message)
            }
        }
    }
}
