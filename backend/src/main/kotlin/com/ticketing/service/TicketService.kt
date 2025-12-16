package com.ticketing.service

import com.ticketing.model.*
import com.ticketing.repository.CommentRepository
import com.ticketing.repository.TicketRepository
import com.ticketing.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

@Service
@Transactional
class TicketService(
    private val ticketRepository: TicketRepository,
    private val userRepository: UserRepository,
    private val commentRepository: CommentRepository,
    private val emailService: EmailService
) {

    fun createTicket(ticket: Ticket, ownerEmail: String): Ticket {
        val owner = userRepository.findByEmail(ownerEmail)
            .orElseThrow { IllegalStateException("Authenticated user not found") }

        ticket.owner = owner
        ticket.createdAt = Instant.now()

        val saved = ticketRepository.save(ticket)
        emailService.sendTicketCreatedNotification(owner.email, saved.id, saved.subject)
        return saved
    }

    fun getTicket(id: Long): Ticket =
        ticketRepository.findById(id)
            .orElseThrow { NoSuchElementException("Ticket not found") }

    /**
     * RBAC RULES
     * ----------
     * ADMIN → all tickets
     * AGENT → assigned tickets
     * USER  → own tickets
     */
    fun searchTickets(email: String, query: String?, status: String?): List<Ticket> {

        val user = userRepository.findByEmail(email)
            .orElseThrow { IllegalStateException("Authenticated user not found") }

        val roles = user.roles ?: emptySet()

        val isAdmin = roles.contains(Role.ROLE_ADMIN)
        val isAgent = roles.contains(Role.ROLE_AGENT)

        val baseTickets = when {
            isAdmin -> ticketRepository.findAll()
            isAgent -> user.id?.let { ticketRepository.findByAssigneeId(it) } ?: emptyList()
            else -> user.id?.let { ticketRepository.findByOwnerId(it) } ?: emptyList()
        }

        val statusFiltered = status
            ?.takeIf { it.isNotBlank() && it != "ALL" }
            ?.let {
                runCatching { Status.valueOf(it) }.getOrNull()
            }
            ?.let { desired ->
                baseTickets.filter { it.status == desired }
            } ?: baseTickets

        val searchFiltered = query
            ?.trim()
            ?.takeIf { it.isNotBlank() }
            ?.lowercase()
            ?.let { q ->
                statusFiltered.filter {
                    it.subject.contains(q, ignoreCase = true) ||
                    it.description.contains(q, ignoreCase = true)
                }
            } ?: statusFiltered

        return searchFiltered.distinctBy { it.id }
    }

    fun assignTicket(ticketId: Long, assigneeId: Long): Ticket {
        val ticket = getTicket(ticketId)

        val assignee = userRepository.findById(assigneeId)
            .orElseThrow { NoSuchElementException("Assignee not found") }

        ticket.assignee = assignee
        val saved = ticketRepository.save(ticket)

        emailService.sendTicketAssignedNotification(assignee.email, saved.id)
        return saved
    }

    fun changeStatus(ticketId: Long, status: Status): Ticket {
        val ticket = getTicket(ticketId)

        ticket.status = status
        val saved = ticketRepository.save(ticket)

        ticket.owner?.email?.let {
            emailService.sendTicketStatusChangeNotification(it, saved.id, status.name)
        }

        return saved
    }

    fun addComment(ticketId: Long, authorEmail: String, text: String) {
        val ticket = getTicket(ticketId)

        val author = userRepository.findByEmail(authorEmail)
            .orElseThrow { IllegalStateException("Authenticated user not found") }

        val comment = Comment(
            text = text,
            author = author,
            ticket = ticket
        )

        commentRepository.save(comment)
    }

    fun countActiveTicketsForAgent(agentId: Long): Int {
        return ticketRepository.findByAssigneeId(agentId)
            .count { it.status == Status.OPEN || it.status == Status.IN_PROGRESS }
    }
}
