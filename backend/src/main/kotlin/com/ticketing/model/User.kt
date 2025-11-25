package com.ticketing.model

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.persistence.*

@Entity
@Table(name = "users")
data class User(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(unique = true, nullable = false)
    var email: String = "",

    @Column(nullable = false)
    @JsonIgnore  // Never send password to frontend
    var password: String = "",

    var name: String? = null,

    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @JsonIgnore  // Hide the internal roles set
    var roles: MutableSet<Role> = mutableSetOf(Role.ROLE_USER)
) {
    // Expose roles as a list of strings for JSON serialization
    @JsonProperty("roles")
    fun getRoleNames(): List<String> = roles.map { it.name }.toList()
}
