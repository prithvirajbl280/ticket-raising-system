package com.ticketing.service

import com.ticketing.model.*
import com.ticketing.repository.CommentRepository
import com.ticketing.repository.TicketRepository
import com.ticketing.repository.UserRepository
import org.springframework.stereotype.Service
import java.util.*

@Service
class TicketService(
    private val ticketRepository: TicketRepository,
    private val userRepository: UserRepository,
    private val commentRepository: CommentRepository
) {
    fun createTicket(ticket: Ticket, ownerEmail: String): Ticket {
        val owner = userRepository.findByEmail(ownerEmail).orElseThrow { RuntimeException("User not found") }
        ticket.owner = owner
        ticket.createdAt = java.time.Instant.now()
        return ticketRepository.save(ticket)
    }

    fun getTicket(id: Long): Optional<Ticket> = ticketRepository.findById(id)

    fun listTicketsForUser(email: String): List<Ticket> {
        val user = userRepository.findByEmail(email).orElseThrow { RuntimeException("User not found") }
        return when {
            user.roles.contains(Role.ROLE_ADMIN) -> ticketRepository.findAll()
            user.roles.contains(Role.ROLE_AGENT) -> ticketRepository.findByAssigneeId(user.id)
            else -> ticketRepository.findByOwnerId(user.id)
        }
    }

    fun assignTicket(ticketId: Long, assigneeId: Long): Ticket {
        val ticket = ticketRepository.findById(ticketId).orElseThrow { RuntimeException("Ticket not found") }
        val assignee = userRepository.findById(assigneeId).orElseThrow { RuntimeException("Assignee not found") }
        ticket.assignee = assignee
        return ticketRepository.save(ticket)
    }

    fun changeStatus(ticketId: Long, status: Status): Ticket {
        val ticket = ticketRepository.findById(ticketId).orElseThrow { RuntimeException("Ticket not found") }
        ticket.status = status
        return ticketRepository.save(ticket)
    }

    fun addComment(ticketId: Long, authorEmail: String, text: String) {
        val ticket = ticketRepository.findById(ticketId).orElseThrow { RuntimeException("Ticket not found") }
        val author = userRepository.findByEmail(authorEmail).orElseThrow { RuntimeException("User not found") }
        val comment = Comment(text = text, author = author, ticket = ticket)
        ticket.comments.add(comment)
        commentRepository.save(comment)
        ticketRepository.save(ticket)
    }
}
