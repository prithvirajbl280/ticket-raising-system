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

    fun searchTickets(email: String, query: String?, status: String?): List<Ticket> {
        println("DEBUG: searchTickets called with email=$email, query=$query, status=$status")
        
        val user = userRepository.findByEmail(email)
            .orElseThrow { 
                println("ERROR: User not found for email: $email")
                IllegalStateException("Authenticated user not found") 
            }

        println("DEBUG: User found - id=${user.id}, email=${user.email}, roles=${user.roles}")

        val roles = user.roles ?: emptySet()
        println("DEBUG: Roles: $roles")

        val isAdmin = roles.contains(Role.ROLE_ADMIN)
        val isAgent = roles.contains(Role.ROLE_AGENT)
        
        println("DEBUG: isAdmin=$isAdmin, isAgent=$isAgent")

        val baseTickets = when {
            isAdmin -> {
                println("DEBUG: Fetching ALL tickets (admin)")
                ticketRepository.findAll()
            }
            isAgent -> {
                println("DEBUG: Fetching tickets assigned to agent id=${user.id}")
                ticketRepository.findByAssigneeId(user.id)
            }
            else -> {
                println("DEBUG: Fetching tickets owned by user id=${user.id}")
                ticketRepository.findByOwnerId(user.id)
            }
        }

        println("DEBUG: Base tickets fetched: ${baseTickets.size} tickets")

        val statusFiltered = status
            ?.takeIf { it.isNotBlank() && it != "ALL" }
            ?.let {
                println("DEBUG: Filtering by status: $it")
                runCatching { Status.valueOf(it) }.getOrNull()
            }
            ?.let { desired ->
                baseTickets.filter { it.status == desired }
            } ?: baseTickets

        println("DEBUG: After status filter: ${statusFiltered.size} tickets")

        val searchFiltered = query
            ?.trim()
            ?.takeIf { it.isNotBlank() }
            ?.lowercase()
            ?.let { q ->
                println("DEBUG: Filtering by search query: $q")
                statusFiltered.filter {
                    it.subject.contains(q, ignoreCase = true) ||
                    it.description.contains(q, ignoreCase = true)
                }
            } ?: statusFiltered

        println("DEBUG: After search filter: ${searchFiltered.size} tickets")
        
        val result = searchFiltered.distinctBy { it.id }
        println("DEBUG: Final result: ${result.size} unique tickets")
        
        return result
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
