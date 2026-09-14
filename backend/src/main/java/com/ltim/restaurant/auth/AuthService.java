package com.ltim.restaurant.auth;

import com.ltim.restaurant.config.JwtService;
import com.ltim.restaurant.user.User;
import com.ltim.restaurant.user.UserRepository;
import com.ltim.restaurant.user.UserRole;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;

import static com.ltim.restaurant.auth.AuthDtos.*;

@Service
public class AuthService {
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;

	public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
	}

	public AuthResponse register(RegisterRequest req) {
		String email = req.email().trim().toLowerCase();
		if (userRepository.existsByEmail(email)) {
			throw new IllegalArgumentException("Email already registered");
		}

		User user = User.builder()
				.email(email)
				.passwordHash(passwordEncoder.encode(req.password()))
				.role(UserRole.USER)
				.createdAt(Instant.now())
				.build();
		user = userRepository.save(user);

		String token = jwtService.issueAccessToken(user);
		return new AuthResponse(token, "Bearer", user.getId(), user.getEmail(), user.getRole());
	}

	public AuthResponse login(LoginRequest req) {
		String email = req.email().trim().toLowerCase();
		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

		if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
			throw new IllegalArgumentException("Invalid credentials");
		}

		String token = jwtService.issueAccessToken(user);
		return new AuthResponse(token, "Bearer", user.getId(), user.getEmail(), user.getRole());
	}
}
