package com.ticketing.repository

import com.ticketing.model.Comment
import org.springframework.data.jpa.repository.JpaRepository

interface CommentRepository : JpaRepository<Comment, Long> {
    fun findByTicketIdOrderByCreatedAtAsc(ticketId: Long): List<Comment>
}
