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

    fun searchTickets(email: String, query: String?, status: String?): List<Ticket> {
        val user = userRepository.findByEmail(email).orElseThrow { RuntimeException("User not found") }
        
        val spec = Specification<Ticket> { root, _, cb ->
            val predicates = mutableListOf<Predicate>()
            
            // RBAC Filter - FIXED LOGIC
            val isAdmin = user.roles.any { it.name == Role.ROLE_ADMIN.name }
            val isAgent = user.roles.any { it.name == Role.ROLE_AGENT.name }
            
            if (!isAdmin) {
                if (isAgent) {
                    // Agents see tickets assigned to them OR unassigned tickets
                    predicates.add(
                        cb.or(
                            cb.equal(root.get<User>("assignee").get<Long>("id"), user.id),
                            cb.isNull(root.get<User>("assignee"))
                        )
                    )
                } else {
                    // Regular users see only their own tickets
                    predicates.add(cb.equal(root.get<User>("owner").get<Long>("id"), user.id))
                }
            }
            // Admins see ALL tickets (no filter needed)

            // Status Filter
            if (!status.isNullOrBlank() && status != "ALL") {
                try {
                    predicates.add(cb.equal(root.get<Status>("status"), Status.valueOf(status)))
                } catch (e: IllegalArgumentException) {
                    // Invalid status, ignore filter
                }
            }

            // Search Query - search in subject and description
            if (!query.isNullOrBlank()) {
                val likePattern = "%${query.lowercase()}%"
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("subject")), likePattern),
                    cb.like(cb.lower(root.get("description")), likePattern)
                ))
            }

            cb.and(*predicates.toTypedArray())
        }
        
        return ticketRepository.findAll(spec)
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

    fun addComment(ticketId: Long, authorEmail: String, text: String) {
        val ticket = ticketRepository.findById(ticketId).orElseThrow { RuntimeException("Ticket not found") }
        val author = userRepository.findByEmail(authorEmail).orElseThrow { RuntimeException("User not found") }
        val comment = Comment(text = text, author = author, ticket = ticket)
        ticket.comments.add(comment)
        commentRepository.save(comment)
        ticketRepository.save(ticket)
    }
}
