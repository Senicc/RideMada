package com.ridemada.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ridemada.data.remote.RideMadaApi
import com.ridemada.data.remote.dto.PaymentConfirmRequest
import com.ridemada.data.remote.dto.PaymentInitRequest
import com.ridemada.data.remote.dto.PaymentDto
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class PaymentUiState(
    val isLoading: Boolean = false,
    val isPaid: Boolean = false,
    val error: String? = null,
    val instructions: String? = null,
    val isPolling: Boolean = false,
)

@HiltViewModel
class PaymentViewModel @Inject constructor(
    private val api: RideMadaApi,
) : ViewModel() {

    private val _state = MutableStateFlow(PaymentUiState())
    val state = _state.asStateFlow()

    fun processPayment(
        rideRequestId: String,
        method: String,
        phone: String? = null,
        onSuccess: () -> Unit,
    ) {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null, instructions = null)
            runCatching {
                val init = api.initiatePayment(
                    PaymentInitRequest(
                        rideRequestId = rideRequestId,
                        method = method,
                        phone = phone?.takeIf { it.isNotBlank() },
                    ),
                )
                if (!init.isSuccessful) error(init.body()?.message ?: init.message())
                val body = init.body() ?: error("Réponse paiement invalide")
                val payment = body.payment ?: error(body.message ?: "Paiement échoué")

                if (method == "CASH") {
                    val confirm = api.confirmCashPayment(PaymentConfirmRequest(rideRequestId = rideRequestId))
                    if (!confirm.isSuccessful) error(confirm.body()?.message ?: confirm.message())
                    payment
                } else {
                    _state.value = _state.value.copy(
                        isLoading = false,
                        instructions = body.instructions,
                        isPolling = true,
                    )
                    if (payment.status == "COMPLETED") {
                        payment
                    } else {
                        pollPaymentStatus(payment.id, onSuccess)
                        null
                    }
                }
            }.onSuccess { payment ->
                if (payment != null && (method == "CASH" || payment.status == "COMPLETED")) {
                    _state.value = PaymentUiState(isPaid = true)
                    onSuccess()
                }
            }.onFailure { e ->
                _state.value = _state.value.copy(isLoading = false, isPolling = false, error = e.message)
            }
        }
    }

    private suspend fun pollPaymentStatus(paymentId: String, onSuccess: () -> Unit): PaymentDto? {
        repeat(20) {
            delay(3000)
            val statusRes = api.getPaymentStatus(paymentId)
            if (statusRes.isSuccessful) {
                val payment = statusRes.body()?.payment
                when (payment?.status) {
                    "COMPLETED" -> {
                        _state.value = PaymentUiState(isPaid = true)
                        onSuccess()
                        return payment
                    }
                    "FAILED" -> error("Paiement refusé ou annulé")
                }
            }
        }
        _state.value = _state.value.copy(
            isPolling = false,
            error = "Paiement en attente — vérifiez votre téléphone ou réessayez",
        )
        return null
    }
}
