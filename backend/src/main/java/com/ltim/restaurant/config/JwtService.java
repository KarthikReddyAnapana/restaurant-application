package com.ltim.restaurant.config;

import com.ltim.restaurant.user.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {
	private final AppProperties props;
	private final SecretKey key;

	public JwtService(AppProperties props) {
		this.props = props;
		this.key = Keys.hmacShaKeyFor(props.jwt().secret().getBytes(StandardCharsets.UTF_8));
	}

	public String issueAccessToken(User user) {
		Instant now = Instant.now();
		Instant exp = now.plusSeconds(props.jwt().accessTokenTtlSeconds());

		return Jwts.builder()
				.issuer(props.jwt().issuer())
				.subject(String.valueOf(user.getId()))
				.issuedAt(Date.from(now))
				.expiration(Date.from(exp))
				.claims(Map.of(
						"email", user.getEmail(),
						"role", user.getRole().name()
				))
				.signWith(key)
				.compact();
	}

	public JwtPrincipal parse(String token) {
		var claims = Jwts.parser()
				.verifyWith(key)
				.build()
				.parseSignedClaims(token)
				.getPayload();

		Long userId = Long.valueOf(claims.getSubject());
		String email = claims.get("email", String.class);
		String role = claims.get("role", String.class);

		return new JwtPrincipal(userId, email, role);
	}

	public record JwtPrincipal(Long userId, String email, String role) {}
}
