package com.ltim.restaurant.auth;

import com.ltim.restaurant.user.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public final class AuthDtos {
	private AuthDtos() {}

	public record RegisterRequest(
			@Email @NotBlank String email,
			@NotBlank String password
	) {}

	public record LoginRequest(
			@Email @NotBlank String email,
			@NotBlank String password
	) {}

	public record AuthResponse(
			String accessToken,
			String tokenType,
			Long userId,
			String email,
			UserRole role
	) {}
}
