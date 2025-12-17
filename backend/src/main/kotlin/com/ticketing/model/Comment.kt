package com.ticketing.model

import com.fasterxml.jackson.annotation.JsonBackReference
import jakarta.persistence.*
import java.time.Instant

@Entity
data class Comment(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(columnDefinition = "TEXT")
    var text: String = "",

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "author_id")
    var author: User? = null,

    @ManyToOne
    @JoinColumn(name = "ticket_id")
    @JsonBackReference
    var ticket: Ticket? = null,

    var createdAt: Instant = Instant.now()
)
