package com.ticketing.dto

data class AuthRequest(val email: String = "", val password: String = "", val name: String? = null)
