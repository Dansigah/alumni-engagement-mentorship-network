package com.pastpupils.backend.controller;

import com.pastpupils.backend.entity.MentorshipRequest;
import com.pastpupils.backend.entity.MentorshipSession;
import com.pastpupils.backend.entity.User;
import com.pastpupils.backend.entity.AccountStatus;
import com.pastpupils.backend.entity.VerificationStatus;
import com.pastpupils.backend.dto.UserResponse;
import com.pastpupils.backend.repository.MentorshipRequestRepository;
import com.pastpupils.backend.repository.MentorshipSessionRepository;
import com.pastpupils.backend.repository.UserRepository;
import com.pastpupils.backend.service.AccessService;
import com.pastpupils.backend.service.NotificationService;
import java.util.List;
import java.util.Set;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {
    private final MentorshipSessionRepository sessions;
    private final MentorshipRequestRepository mentorships;
    private final UserRepository users;
    private final AccessService access;
    private final NotificationService notifications;

    public SessionController(MentorshipSessionRepository sessions, MentorshipRequestRepository mentorships,
            UserRepository users, AccessService access, NotificationService notifications) {
        this.sessions = sessions;
        this.mentorships = mentorships;
        this.users = users;
        this.access = access;
        this.notifications = notifications;
    }

    @GetMapping
    public java.util.List<MentorshipSession> all() {
        access.requireAdmin();
        return sessions.findAll();
    }

    @GetMapping("/user/{id}")
    public java.util.List<MentorshipSession> user(@PathVariable Long id) {
        access.requireSelfOrAdmin(id);
        return sessions.findByStudentIdOrAlumniId(id, id);
    }

    @GetMapping("/accepted-students")
    public List<UserResponse> acceptedStudents() {
        User current = access.current();
        String role = current.getRole() == null ? "" : current.getRole().trim();
        if (!"ALUMNI".equalsIgnoreCase(role)
                || current.getAccountStatus() != AccountStatus.ACTIVE
                || current.getVerificationStatus() != VerificationStatus.APPROVED) {
            throw access.forbidden();
        }
        return mentorships.findByAlumniId(current.getId()).stream()
                .filter(request -> "ACCEPTED".equalsIgnoreCase(request.getStatus()))
                .map(MentorshipRequest::getStudentId).distinct()
                .map(users::findById).flatMap(java.util.Optional::stream)
                .filter(user -> "STUDENT".equals(user.getRole()))
                .map(UserResponse::new).toList();
    }

    @PostMapping
    @Transactional
    public MentorshipSession create(@RequestBody MentorshipSession session) {
        User current = access.current();
        if (session.getStudentId() == null || session.getAlumniId() == null || session.getSessionDate() == null
                || session.getSessionTime() == null || clean(session.getTopic()) == null) {
            throw new RuntimeException("Student, topic, session date, and session time are required");
        }
        boolean admin = "ADMIN".equals(current.getRole());
        if (!admin && (!"ALUMNI".equals(current.getRole()) || !current.getId().equals(session.getAlumniId()))) {
            throw access.forbidden();
        }

        User student = users.findById(session.getStudentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
        User alumni = users.findById(session.getAlumniId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alumni not found"));
        if (!"STUDENT".equals(student.getRole()) || !"ALUMNI".equals(alumni.getRole())) {
            throw new RuntimeException("Invalid student or alumni");
        }

        if (!mentorships.existsByStudentIdAndAlumniIdAndStatus(
                session.getStudentId(), session.getAlumniId(), "ACCEPTED"))
            throw new RuntimeException("An accepted mentorship is required before scheduling a session");

        validateDetails(session);

        session.setId(null);
        session.setStatus("SCHEDULED");
        session.setTopic(clean(session.getTopic()));
        session.setTitle(session.getTopic());
        session.setNotes(clean(session.getNotes()));
        session.setDescription(session.getNotes());
        session.setSessionDate(session.getSessionDate().toLocalDate().atTime(session.getSessionTime()));
        MentorshipSession saved = sessions.save(session);
        notifications.create(saved.getStudentId(), alumni.getName() + " scheduled a mentorship session: "
                + saved.getTopic() + " on " + saved.getSessionDate().toLocalDate() + " at "
                + saved.getSessionTime() + ".");
        return saved;
    }

    @PutMapping("/{id}/status")
    @Transactional
    public MentorshipSession status(@PathVariable Long id, @RequestParam String status) {
        String value = status.toUpperCase();
        if (!Set.of("COMPLETED", "CANCELLED").contains(value)) {
            throw new RuntimeException("Invalid session status");
        }
        MentorshipSession session = sessions.findByIdForStatusUpdate(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));
        User current = access.current();
        if (!"ADMIN".equals(current.getRole())
                && (!"ALUMNI".equals(current.getRole()) || !current.getId().equals(session.getAlumniId()))) {
            throw access.forbidden();
        }
        if (!"SCHEDULED".equalsIgnoreCase(session.getStatus()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Session has already been processed");
        session.setStatus(value);
        MentorshipSession saved = sessions.save(session);
        User alumni = users.findById(saved.getAlumniId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alumni not found"));
        String message = "CANCELLED".equals(value)
                ? "Your mentorship session with " + alumni.getName() + " was cancelled."
                : "Your mentorship session with " + alumni.getName() + " was marked as completed.";
        notifications.create(saved.getStudentId(), message);
        return saved;
    }

    private void validateDetails(MentorshipSession session) {
        String mode = clean(session.getMode());
        if (mode == null || !Set.of("ONLINE", "PHYSICAL").contains(mode.toUpperCase()))
            throw new RuntimeException("Session mode must be ONLINE or PHYSICAL");
        session.setMode(mode.toUpperCase());
        session.setMeetingLink(clean(session.getMeetingLink()));
        session.setVenue(clean(session.getVenue()));
        if ("ONLINE".equals(session.getMode())) {
            if (session.getMeetingLink() == null || !session.getMeetingLink().matches("^https?://.+"))
                throw new RuntimeException("A valid meeting link is required for online sessions");
            session.setVenue(null);
        } else {
            if (session.getVenue() == null)
                throw new RuntimeException("A venue is required for physical sessions");
            session.setMeetingLink(null);
        }
    }

    private String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
