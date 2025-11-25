package com.ticketing.service

import org.springframework.stereotype.Service

@Service
class EmailService {

    fun sendSimpleMessage(to: String, subject: String, text: String) {
        println("EMAIL DISABLED — would send to: $to | subject: $subject")
    }

    fun sendTicketCreatedNotification(to: String, ticketId: Long, subject: String) {
        println("EMAIL DISABLED — Ticket Created Notification for ticket #$ticketId")
    }

    fun sendTicketStatusChangeNotification(to: String, ticketId: Long, status: String) {
        println("EMAIL DISABLED — Ticket Status changed to $status")
    }

    fun sendTicketAssignedNotification(to: String, ticketId: Long) {
        println("EMAIL DISABLED — Ticket Assigned #$ticketId")
    }
}
