package com.ticketing.service

import com.ticketing.model.*
import com.ticketing.repository.CommentRepository
import com.ticketing.repository.TicketRepository
import com.ticketing.repository.UserRepository
import org.springframework.data.jpa.domain.Specification
import jakarta.persistence.criteria.Predicate
import org.springframework.stereotype.Service
import java.util.*

@Service
class TicketService(
    private val ticketRepository: TicketRepository,
    private val userRepository: UserRepository,
    private val commentRepository: CommentRepository,
    private val emailService: EmailService
) {

    fun createTicket(ticket: Ticket, ownerEmail: String): Ticket {
        val owner = userRepository.findByEmail(ownerEmail)
            .orElseThrow { RuntimeException("User not found") }

        ticket.owner = owner
        ticket.createdAt = java.time.Instant.now()

        val saved = ticketRepository.save(ticket)
        emailService.sendTicketCreatedNotification(owner.email, saved.id, saved.subject)
        return saved
    }

    fun getTicket(id: Long): Optional<Ticket> = ticketRepository.findById(id)

    /**
     * FINAL CORRECT LOGIC:
     * --------------------
     * ADMIN  → ALWAYS sees ALL tickets
     * AGENT  → ONLY assigned tickets
     * USER   → ONLY their own tickets
     *
     * Search and Status apply AFTER RBAC.
     */
    fun searchTickets(email: String, query: String?, status: String?): List<Ticket> {
        val user = userRepository.findByEmail(email)
            .orElseThrow { RuntimeException("User not found") }

        val trimmedQuery = query?.trim()
        val hasSearch = !trimmedQuery.isNullOrBlank()

        val isAdmin = user.roles.contains(Role.ROLE_ADMIN)
        val isAgent = user.roles.contains(Role.ROLE_AGENT)

        // ⭐ STEP 1 — Determine base tickets
        val baseTickets: List<Ticket> = when {
            isAdmin -> ticketRepository.findAll()                  // Admin ALWAYS sees ALL
            isAgent -> ticketRepository.findByAssigneeId(user.id)  // Agent → only assigned
            else -> ticketRepository.findByOwnerId(user.id)        // User → only own
        }

        // ⭐ STEP 2 — Apply status filter
        val statusFiltered = if (!status.isNullOrBlank() && status != "ALL") {
            try {
                val desired = Status.valueOf(status)
                baseTickets.filter { it.status == desired }
            } catch (e: Exception) {
                baseTickets
            }
        } else baseTickets

        // ⭐ STEP 3 — Apply search filter
        val searchFiltered = if (hasSearch) {
            val q = trimmedQuery!!.lowercase()
            statusFiltered.filter {
                it.subject.lowercase().contains(q) ||
                it.description.lowercase().contains(q)
            }
        } else statusFiltered

        return searchFiltered.distinctBy { it.id }
    }

    fun assignTicket(ticketId: Long, assigneeId: Long): Ticket {
        val ticket = ticketRepository.findById(ticketId)
            .orElseThrow { RuntimeException("Ticket not found") }

        val assignee = userRepository.findById(assigneeId)
            .orElseThrow { RuntimeException("User not found") }

        ticket.assignee = assignee
        val saved = ticketRepository.save(ticket)

        emailService.sendTicketAssignedNotification(assignee.email, saved.id)
        return saved
    }

    fun changeStatus(ticketId: Long, status: Status): Ticket {
        val ticket = ticketRepository.findById(ticketId)
            .orElseThrow { RuntimeException("Ticket not found") }

        ticket.status = status
        val saved = ticketRepository.save(ticket)

        ticket.owner?.email?.let {
            emailService.sendTicketStatusChangeNotification(it, saved.id, status.name)
        }

        return saved
    }

    fun addComment(ticketId: Long, authorEmail: String, text: String) {
        val ticket = ticketRepository.findById(ticketId)
            .orElseThrow { RuntimeException("Ticket not found") }

        val author = userRepository.findByEmail(authorEmail)
            .orElseThrow { RuntimeException("User not found") }

        val comment = Comment(text = text, author = author, ticket = ticket)
        commentRepository.save(comment)
    }

    fun countActiveTicketsForAgent(agentId: Long): Int {
        return ticketRepository.findByAssigneeId(agentId)
            .count { it.status == Status.OPEN || it.status == Status.IN_PROGRESS }
    }
}
