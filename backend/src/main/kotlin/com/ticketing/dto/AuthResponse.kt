package com.ticketing.dto

data class AuthResponse(val token: String, val email: String, val roles: List<String>, val name: String?)
