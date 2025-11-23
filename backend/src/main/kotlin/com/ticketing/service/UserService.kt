package com.ticketing.service

import com.ticketing.model.Role
import com.ticketing.model.User
import com.ticketing.repository.UserRepository
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Service
import java.util.*

@Service
class UserService(private val userRepository: UserRepository) {
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
}
