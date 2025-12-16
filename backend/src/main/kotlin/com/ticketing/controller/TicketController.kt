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

    private fun currentEmail(): String =
        SecurityContextHolder.getContext().authentication.principal as String

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
        return ResponseEntity.ok(
            ticketService.searchTickets(currentEmail(), search, status)
        )
    }

    @GetMapping("/{id}")
    fun get(@PathVariable id: Long): ResponseEntity<Ticket> {
        return ResponseEntity.ok(
            ticketService.getTicket(id)   // ✅ FIXED
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
