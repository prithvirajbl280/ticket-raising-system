package com.ticketing.repository

import com.ticketing.model.Status
import com.ticketing.model.Ticket
import org.springframework.data.jpa.repository.JpaRepository

interface TicketRepository : JpaRepository<Ticket, Long> {
    fun findByOwnerId(ownerId: Long): List<Ticket>
    fun findByAssigneeId(assigneeId: Long): List<Ticket>
    fun findByStatus(status: Status): List<Ticket>
    fun findBySubjectContainingIgnoreCase(subject: String): List<Ticket>
}
