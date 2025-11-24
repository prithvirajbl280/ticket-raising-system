package com.ticketing.controller

import com.ticketing.model.Role
import com.ticketing.model.User
import com.ticketing.service.UserService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin")
class AdminController(private val userService: UserService) {

    @GetMapping("/users")
    fun listUsers(): ResponseEntity<List<User>> = ResponseEntity.ok(userService.listAll())

    @PostMapping("/users/{id}/role")
    fun assignRole(@PathVariable id: Long, @RequestParam role: Role): ResponseEntity<Any> {
        val user = userService.findById(id).orElseThrow { RuntimeException("User not found") }
        user.roles.add(role)
        userService.save(user)
        return ResponseEntity.ok(mapOf("message" to "Role added"))
    }

    @DeleteMapping("/users/{id}")
    fun deleteUser(@PathVariable id: Long): ResponseEntity<Any> {
        userService.deleteById(id)
        return ResponseEntity.ok(mapOf("message" to "User removed"))
    }
}
