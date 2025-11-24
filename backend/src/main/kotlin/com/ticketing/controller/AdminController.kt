package com.ticketing.controller

import com.ticketing.model.Role
import com.ticketing.model.Status
import com.ticketing.model.User
import com.ticketing.service.TicketService
import com.ticketing.service.UserService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
class AdminController(
    private val userService: UserService,
    private val ticketService: TicketService
) {

    @GetMapping("/users")
    fun listUsers(): ResponseEntity<List<Map<String, Any>>> {
        val users = userService.listAll().map { user ->
            mapOf(
                "id" to user.id,
                "email" to user.email,
                "name" to (user.name ?: ""),
                "roles" to user.roles.map { it.name }
            )
        }
        return ResponseEntity.ok(users)
    }

    @PostMapping("/users/{id}/role")
    fun assignRole(@PathVariable id: Long, @RequestBody payload: Map<String, String>): ResponseEntity<Any> {
        val roleStr = payload["role"] ?: throw RuntimeException("Role not provided")
        val role = Role.valueOf(roleStr)
        val user = userService.findById(id).orElseThrow { RuntimeException("User not found") }
        user.roles.add(role)
        userService.save(user)
        return ResponseEntity.ok(mapOf("message" to "Role added", "user" to mapOf(
            "id" to user.id,
            "email" to user.email,
            "roles" to user.roles.map { it.name }
        )))
    }

    @DeleteMapping("/users/{id}/role")
    fun removeRole(@PathVariable id: Long, @RequestBody payload: Map<String, String>): ResponseEntity<Any> {
        val roleStr = payload["role"] ?: throw RuntimeException("Role not provided")
        val role = Role.valueOf(roleStr)
        val user = userService.findById(id).orElseThrow { RuntimeException("User not found") }
        user.roles.remove(role)
        userService.save(user)
        return ResponseEntity.ok(mapOf("message" to "Role removed"))
    }

    @DeleteMapping("/users/{id}")
    fun deleteUser(@PathVariable id: Long): ResponseEntity<Any> {
        userService.deleteById(id)
        return ResponseEntity.ok(mapOf("message" to "User removed"))
    }

    @GetMapping("/tickets")
    fun getAllTickets(
        @RequestParam(required = false) status: String?,
        @RequestParam(required = false) priority: String?,
        @RequestParam(required = false) search: String?
    ): ResponseEntity<Any> {
        val tickets = ticketService.getAllTicketsForAdmin(status, priority, search)
        return ResponseEntity.ok(tickets)
    }

    @PutMapping("/tickets/{id}/assign")
    fun forceAssign(@PathVariable id: Long, @RequestParam assigneeId: Long): ResponseEntity<Any> {
        val ticket = ticketService.assignTicket(id, assigneeId)
        return ResponseEntity.ok(ticket)
    }

    @PutMapping("/tickets/{id}/status")
    fun forceChangeStatus(@PathVariable id: Long, @RequestParam status: String): ResponseEntity<Any> {
        val ticket = ticketService.changeStatus(id, Status.valueOf(status))
        return ResponseEntity.ok(ticket)
    }

    @DeleteMapping("/tickets/{id}")
    fun deleteTicket(@PathVariable id: Long): ResponseEntity<Any> {
        ticketService.deleteTicket(id)
        return ResponseEntity.ok(mapOf("message" to "Ticket deleted"))
    }
}
