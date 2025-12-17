package com.ticketing.model

import com.fasterxml.jackson.annotation.JsonManagedReference
import jakarta.persistence.*
import java.time.Instant

@Entity
data class Ticket(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    var subject: String = "",

    @Column(columnDefinition = "TEXT")
    var description: String = "",

    @Enumerated(EnumType.STRING)
    var priority: Priority = Priority.MEDIUM,

    @Enumerated(EnumType.STRING)
    var category: Category = Category.OTHER,

    @Enumerated(EnumType.STRING)
    var status: Status = Status.OPEN,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id")
    var owner: User? = null,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assignee_id")
    var assignee: User? = null,

    var createdAt: Instant = Instant.now(),

    @OneToMany(mappedBy = "ticket", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    var comments: MutableList<Comment> = mutableListOf()
)
