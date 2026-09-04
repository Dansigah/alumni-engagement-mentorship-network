package com.pastpupils.backend.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {
    @Value("${jwt.secret}")
    private String jwtSecret;

    private SecretKey key() {
        try {
            byte[] h = MessageDigest.getInstance("SHA-256").digest(jwtSecret.getBytes(StandardCharsets.UTF_8));
            return Keys.hmacShaKeyFor(h);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public String generateToken(String email, String role) {
        return Jwts.builder().subject(email).claims(Map.of("role", role)).issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 86400000)).signWith(key()).compact();
    }

    public String extractEmail(String token) {
        return Jwts.parser().verifyWith(key()).build().parseSignedClaims(token).getPayload().getSubject();
    }
}
