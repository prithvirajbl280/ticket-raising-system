package com.ticketing.service

import com.ticketing.model.Role
import com.ticketing.model.User
import com.ticketing.repository.UserRepository
import com.ticketing.model.PasswordResetToken
import com.ticketing.repository.PasswordResetTokenRepository
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Service
import java.util.*
import java.time.LocalDateTime

@Service
class UserService(
    private val userRepository: UserRepository,
    private val tokenRepository: PasswordResetTokenRepository,
    private val emailService: EmailService
) {
    private val encoder = BCryptPasswordEncoder()

    fun register(email: String, password: String, name: String?): User {
        if (userRepository.existsByEmail(email)) throw RuntimeException("Email already used")
        val user = User(email = email, password = encoder.encode(password), name = name, roles = mutableSetOf(Role.ROLE_USER))
        return userRepository.save(user)
    }

    fun findByEmail(email: String): Optional<User> = userRepository.findByEmail(email)

    fun findById(id: Long) = userRepository.findById(id)

    fun listAll() = userRepository.findAll()

    fun save(user: User) = userRepository.save(user)

    fun deleteById(id: Long) = userRepository.deleteById(id)

    fun createPasswordResetTokenForUser(email: String) {
        val user = userRepository.findByEmail(email).orElseThrow { RuntimeException("User not found") }
        val token = UUID.randomUUID().toString()
        val myToken = PasswordResetToken(token = token, user = user, expiryDate = LocalDateTime.now().plusHours(24))
        tokenRepository.save(myToken)
        emailService.sendSimpleMessage(user.email, "Password Reset Request", "To reset your password, use this token: $token")
    }

    fun validatePasswordResetToken(token: String): String? {
        val passToken = tokenRepository.findByToken(token).orElse(null) ?: return "invalidToken"
        return if (passToken.expiryDate.isBefore(LocalDateTime.now())) "expired" else null
    }

    fun getUserByPasswordResetToken(token: String): Optional<User> {
        return Optional.ofNullable(tokenRepository.findByToken(token).orElse(null)?.user)
    }

    fun changeUserPassword(user: User, password: String) {
        user.password = encoder.encode(password)
        userRepository.save(user)
    }
}
