package com.pastpupils.backend.config;

import com.pastpupils.backend.repository.UserRepository;
import com.pastpupils.backend.service.JwtService;
import com.pastpupils.backend.entity.AccountStatus;
import com.pastpupils.backend.entity.VerificationStatus;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwt;
    private final UserRepository users;

    public JwtAuthenticationFilter(JwtService jwt, UserRepository users) {
        this.jwt = jwt;
        this.users = users;
    }

    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        String h = req.getHeader("Authorization");
        if (h != null && h.startsWith("Bearer ")) {
            try {
                String email = jwt.extractEmail(h.substring(7));
                users.findByEmail(email)
                        .filter(u -> u.getAccountStatus() == AccountStatus.ACTIVE)
                        .filter(u -> u.getRole() != null)
                        .filter(u -> !"ALUMNI".equalsIgnoreCase(u.getRole().trim())
                                || u.getVerificationStatus() == VerificationStatus.APPROVED)
                        .ifPresent(u -> SecurityContextHolder.getContext()
                                .setAuthentication(new UsernamePasswordAuthenticationToken(email, null,
                                        List.of(new SimpleGrantedAuthority("ROLE_" + u.getRole().trim().toUpperCase())))));
            } catch (Exception ignored) {
            }
        }
        chain.doFilter(req, res);
    }
}
