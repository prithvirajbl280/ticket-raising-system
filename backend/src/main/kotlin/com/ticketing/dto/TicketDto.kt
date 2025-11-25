package com.ticketing.dto

data class TicketDto(val subject: String, val description: String, val priority: String = "MEDIUM", val category: String = "OTHER")
