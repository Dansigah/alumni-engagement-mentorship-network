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
@RequestMapping("/api/mentorships")
public class MentorshipRequestController {
    private final MentorshipRequestRepository repo;
    private final UserRepository users;
    private final NotificationService notes;
    private final AccessService access;

    public MentorshipRequestController(MentorshipRequestRepository repo, UserRepository users,
            NotificationService notes, AccessService access) {
        this.repo = repo;
        this.users = users;
        this.notes = notes;
        this.access = access;
    }

    @GetMapping
    public List<MentorshipRequest> all() {
        access.requireAdmin();
        return repo.findAll();
    }

    @GetMapping("/student/{id}")
    public List<MentorshipRequest> student(@PathVariable Long id) {
        access.requireSelfOrAdmin(id);
        return repo.findByStudentId(id);
    }

    @GetMapping("/alumni/{id}")
    public List<MentorshipRequest> alumni(@PathVariable Long id) {
        access.requireSelfOrAdmin(id);
        return repo.findByAlumniId(id);
    }

    @PostMapping
    public MentorshipRequest create(@RequestBody MentorshipRequest r) {
        User current = access.requireRole("STUDENT");
        if (r.getStudentId() == null || !current.getId().equals(r.getStudentId()))
            throw access.forbidden();
        User mentor = users.findById(r.getAlumniId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alumni not found"));
        if (!"ALUMNI".equals(mentor.getRole()))
            throw new RuntimeException("Selected mentor is not an Alumni");
        if (repo.existsByStudentIdAndAlumniIdAndStatus(r.getStudentId(), r.getAlumniId(), "PENDING"))
            throw new RuntimeException("A pending request already exists");
        r.setId(null);
        r.setStatus("PENDING");
        MentorshipRequest saved = repo.save(r);
        notes.create(saved.getAlumniId(), "New mentorship request received");
        return saved;
    }

    @PutMapping("/{id}/status")
    @Transactional
    public MentorshipRequest status(@PathVariable Long id, @RequestParam String status) {
        String v = status.toUpperCase();
        if (!Set.of("ACCEPTED", "REJECTED").contains(v))
            throw new RuntimeException("Invalid mentorship status");
        MentorshipRequest r = repo.findByIdForStatusUpdate(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mentorship request not found"));
        User current = access.current();
        if (!"ADMIN".equals(current.getRole())
                && (!"ALUMNI".equals(current.getRole()) || !current.getId().equals(r.getAlumniId())))
            throw access.forbidden();
        if (!"PENDING".equalsIgnoreCase(r.getStatus()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Mentorship request has already been processed");
        r.setStatus(v);
        MentorshipRequest saved = repo.save(r);
        User alumni = users.findById(saved.getAlumniId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alumni not found"));
        notes.create(saved.getStudentId(), "Your mentorship request to " + alumni.getName()
                + " has been " + v.toLowerCase() + ".");
        return saved;
    }
}
