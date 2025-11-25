package com.ticketing.repository

import com.ticketing.model.Status
import com.ticketing.model.Ticket
import org.springframework.data.jpa.repository.JpaRepository

import org.springframework.data.jpa.repository.JpaSpecificationExecutor

interface TicketRepository : JpaRepository<Ticket, Long>, JpaSpecificationExecutor<Ticket> {
    fun findByOwnerId(ownerId: Long): List<Ticket>
    fun findByAssigneeId(assigneeId: Long): List<Ticket>
    fun findByStatus(status: Status): List<Ticket>
    fun findBySubjectContainingIgnoreCase(subject: String): List<Ticket>
}
