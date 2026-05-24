package com.ridemada.presentation.navigation

import com.ridemada.domain.model.UserRole
import com.ridemada.domain.model.homeRoute

object RoleNavigation {
    fun homeForRole(role: String?): String = UserRole.fromApi(role).homeRoute()
}
