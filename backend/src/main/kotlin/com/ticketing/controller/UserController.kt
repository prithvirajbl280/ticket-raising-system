package com.ticketing.controller

import com.ticketing.model.Role
import com.ticketing.model.User
import com.ticketing.service.UserService
import com.ticketing.service.TicketService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

data class AgentWorkloadDto(
    val id: Long,
    val email: String,
    val name: String?,
    val activeTickets: Int
)

@RestController
@RequestMapping("/api/admin")
class UserController(
    private val userService: UserService,
    private val ticketService: TicketService
) {

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    fun listUsers(): ResponseEntity<List<User>> {
        return ResponseEntity.ok(userService.listAll())
    }

    @GetMapping("/agents")
    @PreAuthorize("hasRole('ADMIN')")
    fun listAgentsWithWorkload(): ResponseEntity<List<AgentWorkloadDto>> {
        val agents = userService.listAll().filter { user ->
            user.roles.any { it == Role.ROLE_AGENT }
        }
        
        val agentWorkloads = agents.map { agent ->
            val activeTickets = ticketService.countActiveTicketsForAgent(agent.id)
            AgentWorkloadDto(
                id = agent.id,
                email = agent.email,
                name = agent.name,
                activeTickets = activeTickets
            )
        }.sortedBy { it.activeTickets } // Sort by workload (least busy first)
        
        return ResponseEntity.ok(agentWorkloads)
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun deleteUser(@PathVariable id: Long): ResponseEntity<Any> {
        userService.deleteById(id)
        return ResponseEntity.ok(mapOf("message" to "User deleted successfully"))
    }

    @PutMapping("/users/{id}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    fun updateUserRoles(@PathVariable id: Long, @RequestBody roles: List<String>): ResponseEntity<User> {
        val user = userService.findById(id).orElse(null) ?: return ResponseEntity.notFound().build()
        
        val newRoles = roles.mapNotNull { roleName ->
            try {
                Role.valueOf(roleName)
            } catch (e: IllegalArgumentException) {
                null
            }
        }.toMutableSet()

        if (newRoles.isEmpty()) {
             // Ensure at least ROLE_USER if nothing valid provided, or handle as error. 
             // For now, let's default to ROLE_USER if empty to prevent lockouts, or just keep it empty?
             // Better to just add ROLE_USER if they strip everything, or maybe just let them have what they asked (if valid).
             // Let's assume the UI sends valid roles. If empty, maybe they want to remove all access? 
             // But User entity defaults to ROLE_USER. Let's just set what they give.
             // Actually, let's ensure ROLE_USER is always there? No, maybe they want to be just ADMIN.
        }

        user.roles = newRoles
        return ResponseEntity.ok(userService.save(user))
    }
}
