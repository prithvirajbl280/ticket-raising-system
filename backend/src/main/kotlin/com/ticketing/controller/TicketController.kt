package com.ticketing.controller

import com.ticketing.dto.TicketDto
import com.ticketing.model.*
import com.ticketing.service.TicketService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/tickets")
class TicketController(
    private val ticketService: TicketService
) {

    private fun currentEmail(): String {
        val auth = SecurityContextHolder.getContext().authentication
        if (auth == null || auth.principal == null) {
            throw IllegalStateException("No authentication found")
        }
        return auth.principal as? String 
            ?: throw IllegalStateException("Invalid authentication principal")
    }

    @PostMapping
    fun create(@RequestBody dto: TicketDto): ResponseEntity<Ticket> {
        val ticket = Ticket(
            subject = dto.subject,
            description = dto.description,
            priority = Priority.valueOf(dto.priority),
            category = Category.valueOf(dto.category)
        )
        return ResponseEntity.ok(
            ticketService.createTicket(ticket, currentEmail())
        )
    }

    @GetMapping
    fun list(
        @RequestParam(required = false) search: String?,
        @RequestParam(required = false) status: String?
    ): ResponseEntity<List<Ticket>> {
        return try {
            val email = currentEmail()
            println("DEBUG: Fetching tickets for user: $email") // Add logging
            val tickets = ticketService.searchTickets(email, search, status)
            println("DEBUG: Found ${tickets.size} tickets") // Add logging
            ResponseEntity.ok(tickets)
        } catch (e: Exception) {
            println("ERROR: Failed to fetch tickets - ${e.message}") // Add logging
            e.printStackTrace()
            throw e
        }
    }

    @GetMapping("/{id}")
    fun get(@PathVariable id: Long): ResponseEntity<Ticket> {
        return ResponseEntity.ok(
            ticketService.getTicket(id)
        )
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    fun assign(
        @PathVariable id: Long,
        @RequestParam assigneeId: Long
    ): ResponseEntity<Ticket> {
        return ResponseEntity.ok(
            ticketService.assignTicket(id, assigneeId)
        )
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    fun changeStatus(
        @PathVariable id: Long,
        @RequestParam status: String
    ): ResponseEntity<Ticket> {
        return ResponseEntity.ok(
            ticketService.changeStatus(id, Status.valueOf(status))
        )
    }

    @PostMapping("/{id}/comments")
    fun addComment(
        @PathVariable id: Long,
        @RequestBody body: Map<String, String>
    ): ResponseEntity<String> {
        val text = body["text"] ?: throw IllegalArgumentException("Comment text is required")
        ticketService.addComment(id, currentEmail(), text)
        return ResponseEntity.ok("Comment added")
    }
}
