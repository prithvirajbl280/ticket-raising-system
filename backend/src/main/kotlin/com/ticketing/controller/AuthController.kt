package com.ticketing.controller

import com.ticketing.config.JwtUtil
import com.ticketing.dto.AuthRequest
import com.ticketing.dto.AuthResponse
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
        return ResponseEntity.ok(AuthResponse(token, user.email, user.roles.map { it.name }))
    }

    @PostMapping("/login")
    fun login(@RequestBody req: AuthRequest): ResponseEntity<Any> {
        val user = userService.findByEmail(req.email).orElseThrow { RuntimeException("Invalid credentials") }
        if (!encoder.matches(req.password, user.password)) throw RuntimeException("Invalid credentials")
        val token = jwtUtil.generateToken(user.email, user.roles)
        return ResponseEntity.ok(AuthResponse(token, user.email, user.roles.map { it.name }))
    }
}
