package com.ltim.restaurant.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "app")
public record AppProperties(
		Jwt jwt,
		Cors cors
) {
	public record Jwt(
			String issuer,
			String secret,
			long accessTokenTtlSeconds
	) {}

	public record Cors(
			List<String> allowedOrigins
	) {}
}
