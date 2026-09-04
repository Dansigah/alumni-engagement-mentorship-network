package com.pastpupils.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.pastpupils.backend.entity.AccountStatus;
import com.pastpupils.backend.entity.User;
import com.pastpupils.backend.entity.VerificationStatus;
import com.pastpupils.backend.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

class UserServiceTest {
    private UserRepository repository;
    private PasswordEncoder encoder;
    private UserService service;

    @BeforeEach
    void setUp() {
        repository = mock(UserRepository.class);
        encoder = mock(PasswordEncoder.class);
        service = new UserService(repository, encoder);
        when(encoder.encode(any())).thenReturn("encoded");
        when(repository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void studentRegistrationIsActiveAndApproved() {
        User user = registration("STUDENT");

        User saved = service.create(user);

        assertEquals(AccountStatus.ACTIVE, saved.getAccountStatus());
        assertEquals(VerificationStatus.APPROVED, saved.getVerificationStatus());
    }

    @Test
    void alumniRegistrationIsActiveAndPending() {
        User user = registration("ALUMNI");

        User saved = service.create(user);

        assertEquals(AccountStatus.ACTIVE, saved.getAccountStatus());
        assertEquals(VerificationStatus.PENDING, saved.getVerificationStatus());
    }

    @Test
    void pendingAlumniCannotLogin() {
        User user = loginUser(VerificationStatus.PENDING, AccountStatus.ACTIVE);

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.login(user.getEmail(), "secret1"));

        assertEquals("Account pending Admin approval", error.getReason());
    }

    @Test
    void rejectedAlumniCannotLogin() {
        User user = loginUser(VerificationStatus.REJECTED, AccountStatus.ACTIVE);

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.login(user.getEmail(), "secret1"));

        assertEquals("Alumni registration rejected", error.getReason());
    }

    @Test
    void suspendedUserCannotLogin() {
        User user = loginUser(VerificationStatus.APPROVED, AccountStatus.SUSPENDED);

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.login(user.getEmail(), "secret1"));

        assertEquals("Account suspended", error.getReason());
    }

    @Test
    void approvedActiveAlumniCanLogin() {
        User user = loginUser(VerificationStatus.APPROVED, AccountStatus.ACTIVE);

        assertSame(user, service.login(user.getEmail(), "secret1"));
    }

    private User registration(String role) {
        User user = new User();
        user.setName("Test User");
        user.setEmail("test@example.com");
        user.setPassword("secret1");
        user.setRole(role);
        return user;
    }

    private User loginUser(VerificationStatus verification, AccountStatus account) {
        User user = registration("ALUMNI");
        user.setVerificationStatus(verification);
        user.setAccountStatus(account);
        when(repository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(encoder.matches("secret1", "secret1")).thenReturn(true);
        user.setPassword("secret1");
        return user;
    }
}
