package com.ticketing.service

import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.stereotype.Service
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

@Service
class EmailService(private val mailSender: JavaMailSender) {

    fun sendSimpleMessage(to: String, subject: String, text: String) {
        try {
            val message = SimpleMailMessage()
            message.setTo(to)
            message.subject = subject
            message.text = text
            mailSender.send(message)
        } catch (e: Exception) {
            println("Failed to send email to $to: ${e.message}")
        }
    }

    fun sendTicketCreatedNotification(to: String, ticketId: Long, subject: String) {
        sendSimpleMessage(to, "Ticket Created: #$ticketId", "Your ticket '$subject' has been created successfully.")
    }

    fun sendTicketStatusChangeNotification(to: String, ticketId: Long, status: String) {
        sendSimpleMessage(to, "Ticket Status Changed: #$ticketId", "Your ticket #$ticketId status has been updated to $status.")
    }

    fun sendTicketAssignedNotification(to: String, ticketId: Long) {
        sendSimpleMessage(to, "Ticket Assigned: #$ticketId", "You have been assigned to ticket #$ticketId.")
    }
}
