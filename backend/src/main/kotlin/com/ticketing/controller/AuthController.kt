package com.ticketing.controller

import com.ticketing.config.JwtUtil
import com.ticketing.dto.AuthRequest
import com.ticketing.dto.AuthResponse
import com.ticketing.dto.ForgotPasswordRequest
import com.ticketing.dto.ResetPasswordRequest
import com.ticketing.service.UserService
import org.springframework.http.ResponseEntity
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
class AuthController(private val userService: UserService, private val jwtUtil: JwtUtil) {
    private val encoder = BCryptPasswordEncoder()

    @PostMapping("/register")
    fun register(@RequestBody req: AuthRequest): ResponseEntity<Any> {
        val user = userService.register(req.email, req.password, req.name)
        val token = jwtUtil.generateToken(user.email, user.roles)
        return ResponseEntity.ok(AuthResponse(token, user.email, user.roles.map { it.name }, user.name))
    }

    @PostMapping("/login")
    fun login(@RequestBody req: AuthRequest): ResponseEntity<Any> {
        val user = userService.findByEmail(req.email).orElseThrow { RuntimeException("Invalid credentials") }
        if (!encoder.matches(req.password, user.password)) throw RuntimeException("Invalid credentials")
        val token = jwtUtil.generateToken(user.email, user.roles)
        return ResponseEntity.ok(AuthResponse(token, user.email, user.roles.map { it.name }, user.name))
    }

    @PostMapping("/forgot-password")
    fun forgotPassword(@RequestBody req: ForgotPasswordRequest): ResponseEntity<Any> {
        userService.createPasswordResetTokenForUser(req.email)
        return ResponseEntity.ok(mapOf("message" to "Reset link sent"))
    }

    @PostMapping("/reset-password")
    fun resetPassword(@RequestBody req: ResetPasswordRequest): ResponseEntity<Any> {
        val result = userService.validatePasswordResetToken(req.token)
        if (result != null) return ResponseEntity.badRequest().body(mapOf("message" to "Invalid or expired token"))
        val user = userService.getUserByPasswordResetToken(req.token)
        if (user.isPresent) {
            userService.changeUserPassword(user.get(), req.newPassword)
            return ResponseEntity.ok(mapOf("message" to "Password updated"))
        }
        return ResponseEntity.badRequest().body(mapOf("message" to "User not found"))
    }
}
