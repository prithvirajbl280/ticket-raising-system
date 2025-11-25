package com.ticketing.controller

import com.ticketing.model.User
import com.ticketing.service.UserService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
class UserController(private val userService: UserService) {

    @GetMapping
    fun listUsers(): ResponseEntity<List<User>> {
        return ResponseEntity.ok(userService.listAll())
    }

    @DeleteMapping("/{id}")
    fun deleteUser(@PathVariable id: Long): ResponseEntity<Any> {
        userService.deleteById(id)
        return ResponseEntity.ok(mapOf("message" to "User deleted successfully"))
    }
}
