package com.ticketing.model

import jakarta.persistence.*
import java.time.Instant

@Entity
data class Comment(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(columnDefinition = "TEXT")
    var text: String = "",

    @ManyToOne
    var author: User? = null,

    @ManyToOne
    @com.fasterxml.jackson.annotation.JsonIgnore
    var ticket: Ticket? = null,

    var createdAt: Instant = Instant.now()
)
