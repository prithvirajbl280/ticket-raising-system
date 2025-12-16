package com.ticketing.controller

import com.ticketing.dto.TicketDto
import com.ticketing.model.*
import com.ticketing.service.TicketService
import com.ticketing.service.UserService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/api/tickets")
class TicketController(
    private val ticketService: TicketService,
    private val userService: UserService
) {

    /**
     * ✅ SAFE way to get logged-in user's email / username
     * Works with JWT, UserDetails, OAuth, etc.
     */
    private fun currentEmail(): String =
        SecurityContextHolder.getContext().authentication.name

    /**
     * ✅ CREATE TICKET
     */
    @PostMapping
    fun create(@RequestBody dto: TicketDto): ResponseEntity<Ticket> {
        val ticket = Ticket(
            subject = dto.subject,
            description = dto.description,
            priority = Priority.valueOf(dto.priority.uppercase()),
            category = Category.valueOf(dto.category.uppercase())
        )

        val created = ticketService.createTicket(ticket, currentEmail())
        return ResponseEntity.ok(created)
    }

    /**
     * ✅ LIST / SEARCH TICKETS
     * Works with or without query params
     */
    @GetMapping
    fun list(
        @RequestParam(required = false) search: String?,
        @RequestParam(required = false) status: String?
    ): ResponseEntity<List<Ticket>> {

        val normalizedStatus = status?.uppercase()

        val tickets = ticketService.searchTickets(
            currentEmail(),
            search,
            normalizedStatus
        )

        return ResponseEntity.ok(tickets)
    }

    /**
     * ✅ GET TICKET BY ID
     */
    @GetMapping("/{id}")
    fun get(@PathVariable id: Long): ResponseEntity<Ticket> {
        val ticket = ticketService.getTicket(id)
            .orElseThrow {
                ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Ticket not found"
                )
            }

        return ResponseEntity.ok(ticket)
    }

    /**
     * ✅ ASSIGN TICKET (ADMIN / AGENT)
     */
    @PutMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    fun assign(
        @PathVariable id: Long,
        @RequestParam assigneeId: Long
    ): ResponseEntity<Ticket> {

        val updated = ticketService.assignTicket(id, assigneeId)
        return ResponseEntity.ok(updated)
    }

    /**
     * ✅ CHANGE STATUS (ADMIN / AGENT)
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    fun changeStatus(
        @PathVariable id: Long,
        @RequestParam status: String
    ): ResponseEntity<Ticket> {

        val updated = ticketService.changeStatus(
            id,
            Status.valueOf(status.uppercase())
        )

        return ResponseEntity.ok(updated)
    }

    /**
     * ✅ ADD COMMENT TO TICKET
     */
    @PostMapping("/{id}/comments")
    fun addComment(
        @PathVariable id: Long,
        @RequestBody body: Map<String, String>
    ): ResponseEntity<String> {

        val text = body["text"]
            ?: throw ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Comment text is required"
            )

        ticketService.addComment(id, currentEmail(), text)
        return ResponseEntity.ok("Comment added")
    }
}
