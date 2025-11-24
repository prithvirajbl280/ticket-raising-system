package com.ticketing.controller

import com.ticketing.service.UserService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/users")
class UserController(private val userService: UserService) {

    @GetMapping("/me")
    fun getCurrentUser(): ResponseEntity<Any> {
        val email = SecurityContextHolder.getContext().authentication.principal as String
        val user = userService.findByEmail(email).orElseThrow { RuntimeException("User not found") }
        return ResponseEntity.ok(mapOf(
            "id" to user.id,
            "email" to user.email,
            "name" to (user.name ?: ""),
            "roles" to user.roles.map { it.name }
        ))
    }

    @GetMapping("/agents")
    fun getAgents(): ResponseEntity<List<Map<String, Any>>> {
        val agents = userService.findAgentsAndAdmins().map { user ->
            mapOf(
                "id" to user.id,
                "email" to user.email,
                "name" to (user.name ?: "")
            )
        }
        return ResponseEntity.ok(agents)
    }
}
