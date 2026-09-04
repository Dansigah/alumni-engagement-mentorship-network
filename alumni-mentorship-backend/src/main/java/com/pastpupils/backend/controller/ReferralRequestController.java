package com.pastpupils.backend.controller;

import com.pastpupils.backend.entity.*;
import com.pastpupils.backend.repository.*;
import com.pastpupils.backend.service.*;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/referrals")
public class ReferralRequestController {
    private final ReferralRequestRepository repo;
    private final UserRepository users;
    private final NotificationService notes;
    private final AccessService access;

    public ReferralRequestController(ReferralRequestRepository repo, UserRepository users, NotificationService notes,
            AccessService access) {
        this.repo = repo;
        this.users = users;
        this.notes = notes;
        this.access = access;
    }

    @GetMapping
    public List<ReferralRequest> all() {
        access.requireAdmin();
        return repo.findAll();
    }

    @GetMapping("/student/{id}")
    public List<ReferralRequest> student(@PathVariable Long id) {
        access.requireSelfOrAdmin(id);
        return repo.findByStudentId(id);
    }

    @GetMapping("/alumni/{id}")
    public List<ReferralRequest> alumni(@PathVariable Long id) {
        access.requireSelfOrAdmin(id);
        return repo.findByAlumniId(id);
    }

    @PostMapping
    public ReferralRequest create(@RequestBody ReferralRequest r) {
        User current = access.requireRole("STUDENT");
        if (r.getStudentId() == null || !current.getId().equals(r.getStudentId()))
            throw access.forbidden();
        User alumni = users.findById(r.getAlumniId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alumni not found"));
        if (!"ALUMNI".equals(alumni.getRole()))
            throw new RuntimeException("Selected user is not an Alumni");
        r.setId(null);
        r.setStatus("PENDING");
        ReferralRequest saved = repo.save(r);
        notes.create(saved.getAlumniId(), "New referral request received");
        return saved;
    }

    @PutMapping("/{id}/status")
    @Transactional
    public ReferralRequest status(@PathVariable Long id, @RequestParam String status) {
        String v = status.toUpperCase();
        if (!Set.of("APPROVED", "REJECTED").contains(v))
            throw new RuntimeException("Invalid referral status");
        ReferralRequest r = repo.findByIdForStatusUpdate(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Referral request not found"));
        User current = access.current();
        if (!"ADMIN".equals(current.getRole())
                && (!"ALUMNI".equals(current.getRole()) || !current.getId().equals(r.getAlumniId())))
            throw access.forbidden();
        if (!"PENDING".equalsIgnoreCase(r.getStatus()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Referral request has already been processed");
        r.setStatus(v);
        ReferralRequest saved = repo.save(r);
        notes.create(saved.getStudentId(), "Referral request " + v.toLowerCase());
        return saved;
    }
}
