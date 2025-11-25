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
        val owner = userRepository.findByEmail(ownerEmail).orElseThrow { RuntimeException("User not found") }
        ticket.owner = owner
        ticket.createdAt = java.time.Instant.now()
        val saved = ticketRepository.save(ticket)
        emailService.sendTicketCreatedNotification(owner.email, saved.id, saved.subject)
        return saved
    }

    fun getTicket(id: Long): Optional<Ticket> = ticketRepository.findById(id)

    /**
     * Search tickets:
     * - Admin: all tickets
     * - Agent: assigned to them OR unassigned
     * - User: only their tickets
     *
     * Search is applied only when query length >= 2 to avoid "a" matching everything.
     * If no predicates are added (no RBAC limit, no status, no search) we return ticketRepository.findAll()
     * to avoid building an empty "and()" predicate which may be ambiguous.
     */
    fun searchTickets(email: String, query: String?, status: String?): List<Ticket> {
        val user = userRepository.findByEmail(email).orElseThrow { RuntimeException("User not found") }

        // Normalize query
        val trimmedQuery = query?.trim()
        val useSearch = !trimmedQuery.isNullOrBlank() && trimmedQuery.length >= 2

        val spec = Specification<Ticket> { root, _, cb ->
            val predicates = mutableListOf<Predicate>()

            // RBAC Filter
            val isAdmin = user.roles.any { it.name == Role.ROLE_ADMIN.name }
            val isAgent = user.roles.any { it.name == Role.ROLE_AGENT.name }

            if (!isAdmin) {
                if (isAgent) {
                    // Agents see tickets assigned to them OR unassigned tickets
                    // Note: use equality on assignee.id and also allow NULL assignee
                    predicates.add(
                        cb.or(
                            cb.equal(root.get<User>("assignee").get<Long>("id"), user.id)
                        )
                    )
                } else {
                    // Regular users see only their own tickets
                    predicates.add(cb.equal(root.get<User>("owner").get<Long>("id"), user.id))
                }
            }
            // Admins see ALL tickets (no RBAC predicate)

            // Status Filter
            if (!status.isNullOrBlank() && status != "ALL") {
                try {
                    predicates.add(cb.equal(root.get<Status>("status"), Status.valueOf(status)))
                } catch (e: IllegalArgumentException) {
                    // ignore invalid status
                }
            }

            // Search Query (only for meaningful queries)
            if (useSearch) {
                val likePattern = "%${trimmedQuery!!.lowercase()}%"
                predicates.add(
                    cb.or(
                        cb.like(cb.lower(root.get("subject")), likePattern),
                        cb.like(cb.lower(root.get("description")), likePattern)
                    )
                )
            }

            // If no predicates were added, return null so we handle this case outside (see below).
            if (predicates.isEmpty()) {
                null
            } else {
                cb.and(*predicates.toTypedArray())
            }
        }

        // If spec would be null (no predicates), return all tickets (admin) or appropriate default.
        // ticketRepository.findAll(null) would throw, so handle explicitly.
        val hasAnyFilter = run {
            // RBAC: if not admin, there is a filter because user or agent predicates were added
            val isAdmin = user.roles.any { it.name == Role.ROLE_ADMIN.name }
            if (!isAdmin) return@run true
            // admin + status/filter/search?
            val statusProvided = !status.isNullOrBlank() && status != "ALL"
            val searchProvided = !trimmedQuery.isNullOrBlank() && trimmedQuery.length >= 2
            statusProvided || searchProvided
        }

        val result = if (!hasAnyFilter) {
            // Admin with no filters -> return everything
            ticketRepository.findAll()
        } else {
            // When specification is not null, run findAll(spec) and ensure unique results
            val raw = ticketRepository.findAll(spec)
            // Defensive dedupe (in case joins caused duplicates)
            raw.distinctBy { it.id }
        }

        return result
    }

    fun assignTicket(ticketId: Long, assigneeId: Long): Ticket {
        val ticket = ticketRepository.findById(ticketId).orElseThrow { RuntimeException("Ticket not found") }
        val assignee = userRepository.findById(assigneeId).orElseThrow { RuntimeException("Assignee not found") }
        ticket.assignee = assignee
        val saved = ticketRepository.save(ticket)
        emailService.sendTicketAssignedNotification(assignee.email, saved.id)
        return saved
    }

    fun changeStatus(ticketId: Long, status: Status): Ticket {
        val ticket = ticketRepository.findById(ticketId).orElseThrow { RuntimeException("Ticket not found") }
        ticket.status = status
        val saved = ticketRepository.save(ticket)
        ticket.owner?.email?.let { emailService.sendTicketStatusChangeNotification(it, saved.id, status.name) }
        return saved
    }

    /**
     * Add comment:
     * - Save the comment entity. No need to save the ticket again (this could cause side-effects).
     */
    fun addComment(ticketId: Long, authorEmail: String, text: String) {
        val ticket = ticketRepository.findById(ticketId).orElseThrow { RuntimeException("Ticket not found") }
        val author = userRepository.findByEmail(authorEmail).orElseThrow { RuntimeException("User not found") }
        val comment = Comment(text = text, author = author, ticket = ticket)
        commentRepository.save(comment)
        // Do NOT call ticketRepository.save(ticket) here — commentRepository.save will persist the relation.
    }

    /**
     * Count active tickets (OPEN or IN_PROGRESS) assigned to a specific agent
     */
    fun countActiveTicketsForAgent(agentId: Long): Int {
        val tickets = ticketRepository.findByAssigneeId(agentId)
        return tickets.count { ticket ->
            ticket.status == Status.OPEN || ticket.status == Status.IN_PROGRESS
        }
    }
}
