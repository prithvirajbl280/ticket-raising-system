package com.ticketing.config

import io.jsonwebtoken.Jwts
import io.jsonwebtoken.SignatureAlgorithm
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.util.*
import com.ticketing.model.Role

@Component
class JwtUtil {
    @Value("\${jwt.secret}")
    private lateinit var secret: String

    @Value("\${jwt.expirationMs}")
    private var expirationMs: Long = 0

    fun generateToken(email: String, roles: Set<Role>): String {
        val claims = Jwts.claims().setSubject(email)
        claims["roles"] = roles.map { it.name }
        val now = Date()
        val exp = Date(now.time + expirationMs)
        return Jwts.builder()
            .setClaims(claims)
            .setIssuedAt(now)
            .setExpiration(exp)
            .signWith(SignatureAlgorithm.HS256, secret.toByteArray())
            .compact()
    }

    fun extractEmail(token: String): String {
        return Jwts.parser().setSigningKey(secret.toByteArray()).parseClaimsJws(token).body.subject
    }

    fun validate(token: String): Boolean {
        return try {
            Jwts.parser().setSigningKey(secret.toByteArray()).parseClaimsJws(token)
            true
        } catch (ex: Exception) {
            false
        }
    }

    fun extractRoles(token: String): List<String> {
        val body = Jwts.parser().setSigningKey(secret.toByteArray()).parseClaimsJws(token).body
        val roles = body["roles"]
        @Suppress("UNCHECKED_CAST")
        return roles as? List<String> ?: listOf()
    }
}
