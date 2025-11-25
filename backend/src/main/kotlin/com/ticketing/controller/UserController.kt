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
}
