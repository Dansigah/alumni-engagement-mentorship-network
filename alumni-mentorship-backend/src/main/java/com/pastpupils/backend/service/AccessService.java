package com.pastpupils.backend.service;

import com.pastpupils.backend.entity.User;
import com.pastpupils.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AccessService {
    private final UserRepository users;

    public AccessService(UserRepository users) {
        this.users = users;
    }

    public User current() {
        Authentication a = SecurityContextHolder.getContext().getAuthentication();
        if (a == null || !a.isAuthenticated() || "anonymousUser".equals(a.getName()))
            throw forbidden();
        return users.findByEmail(a.getName()).orElseThrow(this::forbidden);
    }

    public boolean isAdmin() {
        return "ADMIN".equals(current().getRole());
    }

    public User requireAdmin() {
        User u = current();
        if (!"ADMIN".equals(u.getRole()))
            throw forbidden();
        return u;
    }

    public User requireRole(String role) {
        User u = current();
        if (!role.equals(u.getRole()) && !"ADMIN".equals(u.getRole()))
            throw forbidden();
        return u;
    }

    public User requireSelfOrAdmin(Long id) {
        User u = current();
        if (!"ADMIN".equals(u.getRole()) && !u.getId().equals(id))
            throw forbidden();
        return u;
    }

    public ResponseStatusException forbidden() {
        return new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
    }
}
