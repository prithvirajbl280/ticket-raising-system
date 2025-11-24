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

    fun getTicketForUser(id: Long, email: String): Ticket {
        val user = userRepository.findByEmail(email).orElseThrow { RuntimeException("User not found") }
        val ticket = ticketRepository.findById(id).orElseThrow { RuntimeException("Ticket not found") }
        
        // Check access
        when {
            user.roles.contains(Role.ROLE_ADMIN) -> return ticket
            user.roles.contains(Role.ROLE_AGENT) && ticket.assignee?.id == user.id -> return ticket
            ticket.owner?.id == user.id -> return ticket
            else -> throw RuntimeException("Access denied")
        }
    }

    fun listTicketsForUser(
        email: String,
        status: String?,
        priority: String?,
        search: String?
    ): List<Ticket> {
        val user = userRepository.findByEmail(email).orElseThrow { RuntimeException("User not found") }
        
        val tickets = when {
            user.roles.contains(Role.ROLE_ADMIN) -> ticketRepository.findAll()
            user.roles.contains(Role.ROLE_AGENT) -> {
                val owned = ticketRepository.findByOwnerId(user.id)
                val assigned = ticketRepository.findByAssigneeId(user.id)
                (owned + assigned).distinctBy { it.id }
            }
            else -> ticketRepository.findByOwnerId(user.id)
        }
        
        return filterTickets(tickets, status, priority, search)
    }

    fun getAllTicketsForAdmin(
        status: String?,
        priority: String?,
        search: String?
    ): List<Ticket> {
        val tickets = ticketRepository.findAll()
        return filterTickets(tickets, status, priority, search)
    }

    private fun filterTickets(
        tickets: List<Ticket>,
        status: String?,
        priority: String?,
        search: String?
    ): List<Ticket> {
        var filtered = tickets
        
        if (status != null) {
            filtered = filtered.filter { it.status == Status.valueOf(status) }
        }
        
        if (priority != null) {
            filtered = filtered.filter { it.priority == Priority.valueOf(priority) }
        }
        
        if (search != null && search.isNotBlank()) {
            val searchLower = search.lowercase()
            filtered = filtered.filter {
                it.subject.lowercase().contains(searchLower) ||
                it.description.lowercase().contains(searchLower)
            }
        }
        
        return filtered.sortedByDescending { it.createdAt }
    }

    fun assignTicket(ticketId: Long, assigneeId: Long): Ticket {
        val ticket = ticketRepository.findById(ticketId).orElseThrow { RuntimeException("Ticket not found") }
        val assignee = userRepository.findById(assigneeId).orElseThrow { RuntimeException("Assignee not found") }
        
        if (!assignee.roles.contains(Role.ROLE_AGENT) && !assignee.roles.contains(Role.ROLE_ADMIN)) {
            throw RuntimeException("Assignee must be an agent or admin")
        }
        
        ticket.assignee = assignee
        if (ticket.status == Status.OPEN) {
            ticket.status = Status.IN_PROGRESS
        }
        return ticketRepository.save(ticket)
    }

    fun assignTicketByUser(ticketId: Long, assigneeId: Long, email: String): Ticket {
        val user = userRepository.findByEmail(email).orElseThrow { RuntimeException("User not found") }
        val ticket = ticketRepository.findById(ticketId).orElseThrow { RuntimeException("Ticket not found") }
        
        // Only ticket owner, assigned agent, or admin can reassign
        if (!user.roles.contains(Role.ROLE_ADMIN) &&
            ticket.owner?.id != user.id &&
            ticket.assignee?.id != user.id) {
            throw RuntimeException("Access denied")
        }
        
        return assignTicket(ticketId, assigneeId)
    }

    fun changeStatus(ticketId: Long, status: Status): Ticket {
        val ticket = ticketRepository.findById(ticketId).orElseThrow { RuntimeException("Ticket not found") }
        ticket.status = status
        return ticketRepository.save(ticket)
    }

    fun changeStatusByUser(ticketId: Long, status: Status, email: String): Ticket {
        val user = userRepository.findByEmail(email).orElseThrow { RuntimeException("User not found") }
        val ticket = ticketRepository.findById(ticketId).orElseThrow { RuntimeException("Ticket not found") }
        
        // Check permissions
        if (!user.roles.contains(Role.ROLE_ADMIN) &&
            !user.roles.contains(Role.ROLE_AGENT) &&
            ticket.owner?.id != user.id) {
            throw RuntimeException("Access denied")
        }
        
        ticket.status = status
        return ticketRepository.save(ticket)
    }

    fun addComment(ticketId: Long, authorEmail: String, text: String) {
        val ticket = ticketRepository.findById(ticketId).orElseThrow { RuntimeException("Ticket not found") }
        val author = userRepository.findByEmail(authorEmail).orElseThrow { RuntimeException("User not found") }
        
        // Check access
        if (ticket.owner?.id != author.id &&
            ticket.assignee?.id != author.id &&
            !author.roles.contains(Role.ROLE_ADMIN)) {
            throw RuntimeException("Access denied")
        }
        
        val comment = Comment(text = text, author = author, ticket = ticket)
        ticket.comments.add(comment)
        commentRepository.save(comment)
        ticketRepository.save(ticket)
    }

    fun deleteTicket(id: Long) {
        ticketRepository.deleteById(id)
    }
}
