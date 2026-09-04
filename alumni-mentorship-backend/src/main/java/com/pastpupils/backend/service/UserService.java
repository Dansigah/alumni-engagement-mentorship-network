package com.pastpupils.backend.service;

import com.pastpupils.backend.entity.*;
import com.pastpupils.backend.repository.UserRepository;
import java.util.List;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {

    private final UserRepository repo;
    private final PasswordEncoder encoder;

    public UserService(UserRepository repo, PasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
    }

    public List<User> all() {
        return repo.findAll();
    }

    public List<User> byRole(String role) {
        return repo.findByRoleIgnoreCase(role);
    }

    public List<User> approvedActiveMentors() {
        return repo.findByRoleIgnoreCaseAndVerificationStatusAndAccountStatus(
                "ALUMNI", VerificationStatus.APPROVED, AccountStatus.ACTIVE);
    }

    public List<User> pendingAlumni() {
        return repo.findByRoleIgnoreCaseAndVerificationStatus("ALUMNI", VerificationStatus.PENDING);
    }

    public User get(Long id) {
        return repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    public User create(User u) {

        if (u.getEmail() == null || u.getEmail().isBlank() || u.getPassword() == null || u.getPassword().length() < 6) {

            throw new RuntimeException("A valid email and password of at least 6 characters are required");
        }

        String email = u.getEmail().trim().toLowerCase();

        if (repo.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        String role = u.getRole() == null ? "STUDENT" : u.getRole().trim().toUpperCase();

        if (!Set.of("STUDENT", "ALUMNI").contains(role)) {
            throw new RuntimeException("Role must be STUDENT or ALUMNI");
        }

        // Important:
        // Registration must always create a NEW database record.
        // Never accept an ID supplied by Swagger/frontend.
        u.setId(null);

        u.setEmail(email);

        u.setName(u.getName() == null || u.getName().isBlank() ? email : u.getName().trim());

        u.setRole(role);
        u.setAccountStatus(AccountStatus.ACTIVE);
        u.setVerificationStatus("ALUMNI".equals(role)
                ? VerificationStatus.PENDING
                : VerificationStatus.APPROVED);
        u.setPassword(encoder.encode(u.getPassword()));

        return repo.save(u);
    }

    public User login(String email, String password) {

        if (email == null || password == null) {
            throw new RuntimeException("Invalid email or password");
        }

        User u = repo.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!encoder.matches(password, u.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        ensureLoginAllowed(u);

        return u;
    }

    private void ensureLoginAllowed(User u) {
        if (u.getAccountStatus() == AccountStatus.SUSPENDED) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account suspended");
        }
        if ("ALUMNI".equals(u.getRole()) && u.getVerificationStatus() == VerificationStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account pending Admin approval");
        }
        if ("ALUMNI".equals(u.getRole()) && u.getVerificationStatus() == VerificationStatus.REJECTED) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Alumni registration rejected");
        }
    }

    public User updateVerification(Long id, VerificationStatus status) {
        User u = get(id);
        if (!"ALUMNI".equals(u.getRole())) {
            throw new RuntimeException("Verification status applies only to Alumni");
        }
        u.setVerificationStatus(status);
        return repo.save(u);
    }

    public User updateAccountStatus(Long id, AccountStatus status) {
        User u = get(id);
        u.setAccountStatus(status);
        return repo.save(u);
    }

    public User update(Long id, User n) {

        User u = get(id);

        if (n.getName() != null && !n.getName().isBlank()) {
            u.setName(n.getName().trim());
        }

        if (n.getEmail() != null && !n.getEmail().isBlank()) {

            String email = n.getEmail().trim().toLowerCase();

            if (repo.existsByEmailAndIdNot(email, id)) {
                throw new RuntimeException("Email already registered");
            }

            u.setEmail(email);
        }

        return repo.save(u);
    }

    public void delete(Long id) {
        repo.delete(get(id));
    }
}
