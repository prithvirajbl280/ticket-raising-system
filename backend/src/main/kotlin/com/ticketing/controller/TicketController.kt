package com.ticketing.controller

import com.ticketing.dto.TicketDto
import com.ticketing.model.Priority
import com.ticketing.model.Status
import com.ticketing.model.Ticket
import com.ticketing.service.TicketService
import com.ticketing.service.UserService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*
import org.springframework.security.access.prepost.PreAuthorize

@RestController
@RequestMapping("/api/tickets")
class TicketController(
    private val ticketService: TicketService,
    private val userService: UserService
) {

    private fun currentEmail(): String =
        SecurityContextHolder.getContext().authentication.principal as String

    @PostMapping
    fun create(@RequestBody dto: TicketDto): ResponseEntity<Ticket> {
        val ticket = Ticket(
            subject = dto.subject,
            description = dto.description,
            priority = Priority.valueOf(dto.priority),
            category = com.ticketing.model.Category.valueOf(dto.category)
        )
        val created = ticketService.createTicket(ticket, currentEmail())
        return ResponseEntity.ok(created)
    }

    @GetMapping
    fun list(
        @RequestParam(required = false) search: String?,
        @RequestParam(required = false) status: String?
    ): ResponseEntity<List<Ticket>> {
        val tickets = ticketService.searchTickets(currentEmail(), search, status)
        return ResponseEntity.ok(tickets)
    }

    @GetMapping("/{id}")
    fun get(@PathVariable id: Long): ResponseEntity<Ticket> {
        val t = ticketService.getTicket(id).orElseThrow { RuntimeException("Not found") }
        return ResponseEntity.ok(t)
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    fun assign(@PathVariable id: Long, @RequestParam assigneeId: Long): ResponseEntity<Ticket> {
        val updated = ticketService.assignTicket(id, assigneeId)
        return ResponseEntity.ok(updated)
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    fun changeStatus(@PathVariable id: Long, @RequestParam status: String): ResponseEntity<Ticket> {
        val updated = ticketService.changeStatus(id, Status.valueOf(status))
        return ResponseEntity.ok(updated)
    }

    // ✅ ADD COMMENT ENDPOINT (MISSING EARLIER)
    @PostMapping("/{id}/comments")
    fun addComment(
        @PathVariable id: Long,
        @RequestBody req: com.ticketing.dto.CommentRequest
    ): ResponseEntity<String> {
        if (req.text.isBlank()) throw RuntimeException("Comment text is required")
        ticketService.addComment(id, currentEmail(), req.text)
        return ResponseEntity.ok("Comment added")
    }
}
