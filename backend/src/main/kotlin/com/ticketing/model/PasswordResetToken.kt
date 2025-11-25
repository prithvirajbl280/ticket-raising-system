package com.ticketing.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
data class PasswordResetToken(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    val token: String = "",

    @OneToOne(targetEntity = User::class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "user_id")
    val user: User,

    val expiryDate: LocalDateTime
)
