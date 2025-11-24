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
            priority = Priority.valueOf(dto.priority)
        )
        val created = ticketService.createTicket(ticket, currentEmail())
        return ResponseEntity.ok(created)
    }

    @GetMapping
    fun list(
        @RequestParam(required = false) status: String?,
        @RequestParam(required = false) priority: String?,
        @RequestParam(required = false) search: String?
    ): ResponseEntity<List<Ticket>> {
        val tickets = ticketService.listTicketsForUser(currentEmail(), status, priority, search)
        return ResponseEntity.ok(tickets)
    }

    @GetMapping("/{id}")
    fun get(@PathVariable id: Long): ResponseEntity<Ticket> {
        val t = ticketService.getTicketForUser(id, currentEmail())
        return ResponseEntity.ok(t)
    }

    @PutMapping("/{id}/assign")
    fun assign(@PathVariable id: Long, @RequestParam assigneeId: Long): ResponseEntity<Ticket> {
        val updated = ticketService.assignTicketByUser(id, assigneeId, currentEmail())
        return ResponseEntity.ok(updated)
    }

    @PutMapping("/{id}/status")
    fun changeStatus(@PathVariable id: Long, @RequestParam status: String): ResponseEntity<Ticket> {
        val updated = ticketService.changeStatusByUser(id, Status.valueOf(status), currentEmail())
        return ResponseEntity.ok(updated)
    }
}
