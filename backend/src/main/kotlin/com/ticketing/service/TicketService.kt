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
     * ✔ ADMIN → all tickets
     * ✔ AGENT → only assigned tickets
     * ✔ USER → only their own tickets
     *
     * ✔ Search works correctly for all roles
     */
    fun searchTickets(email: String, query: String?, status: String?): List<Ticket> {
        val user = userRepository.findByEmail(email)
            .orElseThrow { RuntimeException("User not found") }

        val trimmedQuery = query?.trim()
        val useSearch = !trimmedQuery.isNullOrBlank()

        val isAdmin = user.roles.contains(Role.ROLE_ADMIN)
        val isAgent = user.roles.contains(Role.ROLE_AGENT)
        val isUser = user.roles.contains(Role.ROLE_USER)

        val spec = Specification<Ticket> { root, _, cb ->
            val predicates = mutableListOf<Predicate>()

            // ROLE FILTERING
            when {
                isAdmin -> {
                    // NO FILTER → Admin sees everything
                }
                isAgent -> {
                    predicates.add(
                        cb.equal(
                            root.get<User>("assignee").get<Long>("id"),
                            user.id
                        )
                    )
                }
                else -> { // Regular User
                    predicates.add(
                        cb.equal(
                            root.get<User>("owner").get<Long>("id"),
                            user.id
                        )
                    )
                }
            }

            // STATUS FILTER
            if (!status.isNullOrBlank() && status != "ALL") {
                try {
                    predicates.add(
                        cb.equal(
                            root.get<Status>("status"),
                            Status.valueOf(status)
                        )
                    )
                } catch (_: IllegalArgumentException) { }
            }

            // SEARCH FILTER (subject + description)
            if (useSearch) {
                val like = "%${trimmedQuery!!.lowercase()}%"
                predicates.add(
                    cb.or(
                        cb.like(cb.lower(root.get("subject")), like),
                        cb.like(cb.lower(root.get("description")), like)
                    )
                )
            }

            cb.and(*predicates.toTypedArray())
        }

        val results = ticketRepository.findAll(spec)
        return results.distinctBy { it.id }
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
