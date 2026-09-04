package com.pastpupils.backend.controller;

import com.pastpupils.backend.dto.*;
import com.pastpupils.backend.entity.*;
import com.pastpupils.backend.service.*;
import java.util.*;
import org.springframework.http.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService users;
    private final JwtService jwt;
    private final AccessService access;
    private final AlumniProfileService profiles;
    private final NotificationService notifications;

    public UserController(UserService users, JwtService jwt, AccessService access, AlumniProfileService profiles,
            NotificationService notifications) {
        this.users = users;
        this.jwt = jwt;
        this.access = access;
        this.profiles = profiles;
        this.notifications = notifications;
    }

    private UserResponse dto(User u) {
        return new UserResponse(u);
    }

    @GetMapping
    public List<UserResponse> all() {
        access.requireAdmin();
        return users.all().stream().map(this::dto).toList();
    }

    @GetMapping("/{id}")
    public UserResponse one(@PathVariable Long id) {
        User target = users.get(id);
        User current = access.current();
        if (!current.getRole().equals("ADMIN") && !current.getId().equals(id)) {
            boolean visibleMentor = "STUDENT".equals(current.getRole())
                    && "ALUMNI".equals(target.getRole())
                    && target.getVerificationStatus() == VerificationStatus.APPROVED
                    && target.getAccountStatus() == AccountStatus.ACTIVE;
            if (!visibleMentor) throw access.forbidden();
        }
        return dto(target);
    }

    @GetMapping("/mentors")
    public List<UserResponse> mentors() {
        access.current();
        return users.approvedActiveMentors().stream().map(this::dto).map(profiles::enrich).toList();
    }

    @PostMapping({ "", "/register" })
    @Transactional
    public ResponseEntity<UserResponse> register(@RequestBody User u) {
        User registered = users.create(u);
        if ("ALUMNI".equals(registered.getRole())
                && registered.getVerificationStatus() == VerificationStatus.PENDING) {
            users.byRole("ADMIN").stream()
                    .filter(admin -> admin.getAccountStatus() == AccountStatus.ACTIVE)
                    .forEach(admin -> notifications.create(admin.getId(),
                            "New Alumni registration awaiting approval: " + registered.getName()));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(dto(registered));
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest r) {
        User u = users.login(r.getEmail(), r.getPassword());
        return new LoginResponse(u.getId(), u.getName(), u.getEmail(), u.getRole(),
                jwt.generateToken(u.getEmail(), u.getRole()));
    }

    @PutMapping("/{id}")
    public UserResponse update(@PathVariable Long id, @RequestBody User u) {
        access.requireSelfOrAdmin(id);
        return dto(users.update(id, u));
    }

    @DeleteMapping("/{id}")
    public Map<String, String> delete(@PathVariable Long id) {
        access.requireAdmin();
        users.delete(id);
        return Map.of("message", "User deleted successfully");
    }
}
