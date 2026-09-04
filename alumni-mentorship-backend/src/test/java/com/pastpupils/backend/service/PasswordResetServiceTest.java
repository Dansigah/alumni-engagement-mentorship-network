package com.pastpupils.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.pastpupils.backend.dto.ForgotPasswordResponse;
import com.pastpupils.backend.entity.AccountStatus;
import com.pastpupils.backend.entity.PasswordResetToken;
import com.pastpupils.backend.entity.User;
import com.pastpupils.backend.entity.VerificationStatus;
import com.pastpupils.backend.repository.PasswordResetTokenRepository;
import com.pastpupils.backend.repository.UserRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

class PasswordResetServiceTest {
    private PasswordResetTokenRepository tokens;
    private UserRepository users;
    private PasswordEncoder encoder;
    private PasswordResetService service;
    private User user;

    @BeforeEach
    void setUp() {
        tokens = mock(PasswordResetTokenRepository.class);
        users = mock(UserRepository.class);
        encoder = new BCryptPasswordEncoder();
        service = new PasswordResetService(tokens, users, encoder, true, 20);
        user = user("STUDENT", VerificationStatus.APPROVED, AccountStatus.ACTIVE);
        when(users.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(users.findById(user.getId())).thenReturn(Optional.of(user));
        when(users.save(any(User.class))).thenAnswer(call -> call.getArgument(0));
        when(tokens.save(any(PasswordResetToken.class))).thenAnswer(call -> call.getArgument(0));
    }

    @Test
    void registeredUserRequestCreatesShortLivedHashedToken() {
        ForgotPasswordResponse response = service.request("  TEST@EXAMPLE.COM ");
        PasswordResetToken stored = capturedToken();

        assertEquals(PasswordResetService.GENERIC_MESSAGE, response.getMessage());
        assertNotNull(response.getResetToken());
        assertNotEquals(response.getResetToken(), stored.getTokenHash());
        assertTrue(stored.getExpiresAt().isAfter(Instant.now().plusSeconds(19 * 60)));
        assertFalse(stored.isUsed());
        assertEquals(user.getId(), stored.getUserId());
    }

    @Test
    void unknownEmailGetsSameGenericResponseAndDecoyToken() {
        when(users.findByEmail("unknown@example.com")).thenReturn(Optional.empty());
        ForgotPasswordResponse response = service.request("unknown@example.com");

        assertEquals(PasswordResetService.GENERIC_MESSAGE, response.getMessage());
        assertNotNull(response.getResetToken());
        verify(tokens, never()).save(any());
    }

    @Test
    void productionModeDoesNotExposeResetToken() {
        PasswordResetService production = new PasswordResetService(tokens, users, encoder, false, 20);
        assertNull(production.request(user.getEmail()).getResetToken());
    }

    @Test
    void validTokenChangesPasswordAndCanOnlyBeUsedOnce() {
        String raw = issuedToken();
        PasswordResetToken stored = capturedToken();
        when(tokens.findByTokenHash(stored.getTokenHash())).thenReturn(Optional.of(stored));

        service.reset(raw, "newSecret1");
        assertTrue(encoder.matches("newSecret1", user.getPassword()));
        assertFalse(encoder.matches("oldSecret1", user.getPassword()));
        assertTrue(stored.isUsed());

        assertThrows(ResponseStatusException.class, () -> service.reset(raw, "anotherSecret"));
    }

    @Test
    void oldLoginFailsAndNewLoginWorksAfterReset() {
        String raw = issuedToken();
        PasswordResetToken stored = capturedToken();
        when(tokens.findByTokenHash(stored.getTokenHash())).thenReturn(Optional.of(stored));
        service.reset(raw, "newSecret1");

        UserService logins = new UserService(users, encoder);
        assertThrows(RuntimeException.class, () -> logins.login(user.getEmail(), "oldSecret1"));
        assertSame(user, logins.login(user.getEmail(), "newSecret1"));
    }

    @Test
    void invalidTokenIsRejected() {
        assertEquals(400, assertThrows(ResponseStatusException.class,
                () -> service.reset("invalid", "newSecret1")).getStatusCode().value());
    }

    @Test
    void expiredTokenIsRejected() {
        PasswordResetToken stored = token(false, Instant.now().minusSeconds(1));
        when(tokens.findByTokenHash(any())).thenReturn(Optional.of(stored));
        assertEquals(400, assertThrows(ResponseStatusException.class,
                () -> service.reset("expired", "newSecret1")).getStatusCode().value());
        verify(users, never()).save(any());
    }

    @Test
    void usedTokenIsRejected() {
        PasswordResetToken stored = token(true, Instant.now().plusSeconds(60));
        when(tokens.findByTokenHash(any())).thenReturn(Optional.of(stored));
        assertEquals(400, assertThrows(ResponseStatusException.class,
                () -> service.reset("used", "newSecret1")).getStatusCode().value());
        verify(users, never()).save(any());
    }

    @Test
    void weakPasswordIsRejected() {
        assertEquals(400, assertThrows(ResponseStatusException.class,
                () -> service.reset("token", "short")).getStatusCode().value());
        verifyNoInteractions(tokens);
    }

    @Test
    void resetPreservesRoleVerificationAndAccountStatusForAlumni() {
        user = user("ALUMNI", VerificationStatus.APPROVED, AccountStatus.ACTIVE);
        when(users.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(users.findById(user.getId())).thenReturn(Optional.of(user));
        String raw = issuedToken();
        PasswordResetToken stored = capturedToken();
        when(tokens.findByTokenHash(stored.getTokenHash())).thenReturn(Optional.of(stored));

        service.reset(raw, "newSecret1");
        assertEquals("ALUMNI", user.getRole());
        assertEquals(VerificationStatus.APPROVED, user.getVerificationStatus());
        assertEquals(AccountStatus.ACTIVE, user.getAccountStatus());
    }

    @Test
    void pendingAlumniCanResetButStillCannotLogin() {
        user = user("ALUMNI", VerificationStatus.PENDING, AccountStatus.ACTIVE);
        when(users.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(users.findById(user.getId())).thenReturn(Optional.of(user));
        String raw = issuedToken();
        PasswordResetToken stored = capturedToken();
        when(tokens.findByTokenHash(stored.getTokenHash())).thenReturn(Optional.of(stored));

        service.reset(raw, "newSecret1");
        UserService logins = new UserService(users, encoder);
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> logins.login(user.getEmail(), "newSecret1"));
        assertEquals("Account pending Admin approval", error.getReason());
    }

    @Test
    void newRequestConsumesPreviousUnusedTokens() {
        PasswordResetToken previous = token(false, Instant.now().plusSeconds(60));
        when(tokens.findByUserIdAndUsedFalse(user.getId())).thenReturn(List.of(previous));
        service.request(user.getEmail());
        assertTrue(previous.isUsed());
        verify(tokens).saveAll(List.of(previous));
    }

    private String issuedToken() {
        return service.request(user.getEmail()).getResetToken();
    }

    private PasswordResetToken capturedToken() {
        ArgumentCaptor<PasswordResetToken> captor = ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(tokens, atLeastOnce()).save(captor.capture());
        return captor.getAllValues().get(0);
    }

    private PasswordResetToken token(boolean used, Instant expiresAt) {
        PasswordResetToken token = new PasswordResetToken();
        token.setUserId(user.getId());
        token.setTokenHash("hash");
        token.setCreatedAt(Instant.now());
        token.setExpiresAt(expiresAt);
        token.setUsed(used);
        return token;
    }

    private User user(String role, VerificationStatus verification, AccountStatus account) {
        User result = new User();
        result.setId(7L);
        result.setName("Test User");
        result.setEmail("test@example.com");
        result.setPassword(encoder.encode("oldSecret1"));
        result.setRole(role);
        result.setVerificationStatus(verification);
        result.setAccountStatus(account);
        return result;
    }
}
