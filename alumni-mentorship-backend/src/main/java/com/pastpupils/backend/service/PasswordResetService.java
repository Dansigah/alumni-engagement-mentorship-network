package com.pastpupils.backend.service;

import com.pastpupils.backend.dto.ForgotPasswordResponse;
import com.pastpupils.backend.entity.PasswordResetToken;
import com.pastpupils.backend.entity.User;
import com.pastpupils.backend.repository.PasswordResetTokenRepository;
import com.pastpupils.backend.repository.UserRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PasswordResetService {
    static final String GENERIC_MESSAGE = "If an account exists for this email, password reset instructions have been prepared.";
    private final PasswordResetTokenRepository tokens;
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final boolean demoMode;
    private final long expiryMinutes;
    private final SecureRandom random = new SecureRandom();

    public PasswordResetService(PasswordResetTokenRepository tokens, UserRepository users, PasswordEncoder encoder,
            @Value("${app.password-reset.demo-mode:false}") boolean demoMode,
            @Value("${app.password-reset.expiry-minutes:20}") long expiryMinutes) {
        this.tokens = tokens;
        this.users = users;
        this.encoder = encoder;
        this.demoMode = demoMode;
        this.expiryMinutes = expiryMinutes;
    }

    @Transactional
    public ForgotPasswordResponse request(String email) {
        String rawToken = newToken();
        if (email != null && !email.isBlank()) {
            users.findByEmail(email.trim().toLowerCase()).ifPresent(user -> {
                var activeTokens = tokens.findByUserIdAndUsedFalse(user.getId());
                activeTokens.forEach(token -> token.setUsed(true));
                if (!activeTokens.isEmpty()) tokens.saveAll(activeTokens);

                PasswordResetToken token = new PasswordResetToken();
                token.setUserId(user.getId());
                token.setTokenHash(hash(rawToken));
                token.setCreatedAt(Instant.now());
                token.setExpiresAt(Instant.now().plus(expiryMinutes, ChronoUnit.MINUTES));
                token.setUsed(false);
                tokens.save(token);
            });
        }
        return new ForgotPasswordResponse(GENERIC_MESSAGE, demoMode ? rawToken : null);
    }

    @Transactional
    public void reset(String rawToken, String newPassword) {
        if (newPassword == null || newPassword.length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Password must contain at least 6 characters.");
        }
        if (rawToken == null || rawToken.isBlank()) throw invalidToken();

        PasswordResetToken token = tokens.findByTokenHash(hash(rawToken)).orElseThrow(this::invalidToken);
        if (token.isUsed() || !token.getExpiresAt().isAfter(Instant.now())) throw invalidToken();

        User user = users.findById(token.getUserId()).orElseThrow(this::invalidToken);
        user.setPassword(encoder.encode(newPassword));
        token.setUsed(true);
        users.save(user);
        tokens.save(token);
    }

    private String newToken() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException impossible) {
            throw new IllegalStateException("SHA-256 is unavailable", impossible);
        }
    }

    private ResponseStatusException invalidToken() {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired reset token.");
    }
}
