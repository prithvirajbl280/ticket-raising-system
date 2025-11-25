package com.ticketing.controller

import com.ticketing.service.TicketService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
class CommentController(private val ticketService: TicketService) {
    private fun currentEmail(): String =
        SecurityContextHolder.getContext().authentication.principal as String

    // @PostMapping
    // fun addComment(@PathVariable ticketId: Long, @RequestBody payload: Map<String, String>): ResponseEntity<Any> {
    //     val text = payload["text"] ?: throw RuntimeException("Missing text")
    //     ticketService.addComment(ticketId, currentEmail(), text)
    //     return ResponseEntity.ok(mapOf("message" to "Comment added"))
    // }
}
