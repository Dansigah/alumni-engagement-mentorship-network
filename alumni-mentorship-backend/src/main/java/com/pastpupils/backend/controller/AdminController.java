package com.pastpupils.backend.controller;

import com.pastpupils.backend.dto.UserResponse;
import com.pastpupils.backend.entity.AccountStatus;
import com.pastpupils.backend.entity.User;
import com.pastpupils.backend.entity.VerificationStatus;
import com.pastpupils.backend.repository.*;
import com.pastpupils.backend.service.NotificationService;
import com.pastpupils.backend.service.UserService;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final UserRepository users;
    private final MentorshipRequestRepository mentorships;
    private final ReferralRequestRepository referrals;
    private final EventRepository events;
    private final UserService userService;
    private final NotificationService notifications;

    public AdminController(UserRepository users, MentorshipRequestRepository mentorships,
            ReferralRequestRepository referrals, EventRepository events, UserService userService,
            NotificationService notifications) {
        this.users = users;
        this.mentorships = mentorships;
        this.referrals = referrals;
        this.events = events;
        this.userService = userService;
        this.notifications = notifications;
    }

    @GetMapping("/stats")
    public Map<String, Long> stats() {
        return Map.of("totalUsers", users.count(), "totalStudents", (long) users.findByRoleIgnoreCase("STUDENT").size(),
                "totalAlumni", (long) users.findByRoleIgnoreCase("ALUMNI").size(), "mentorshipRequestCount",
                mentorships.count(), "referralRequestCount", referrals.count(), "eventCount", events.count());
    }

    @GetMapping("/users")
    public List<UserResponse> users() {
        return this.users.findAll().stream().map(UserResponse::new).toList();
    }

    @GetMapping("/students")
    public List<UserResponse> students() {
        return users.findByRoleIgnoreCase("STUDENT").stream().map(UserResponse::new).toList();
    }

    @GetMapping("/alumni")
    public List<UserResponse> alumni() {
        return users.findByRoleIgnoreCase("ALUMNI").stream().map(UserResponse::new).toList();
    }

    @GetMapping("/alumni/pending")
    public List<UserResponse> pendingAlumni() {
        return userService.pendingAlumni().stream().map(UserResponse::new).toList();
    }

    @PutMapping("/alumni/{id}/approve")
    public UserResponse approveAlumni(@PathVariable Long id) {
        User user = userService.updateVerification(id, VerificationStatus.APPROVED);
        notifications.create(user.getId(), "Your Alumni registration has been approved");
        return new UserResponse(user);
    }

    @PutMapping("/alumni/{id}/reject")
    public UserResponse rejectAlumni(@PathVariable Long id) {
        User user = userService.updateVerification(id, VerificationStatus.REJECTED);
        notifications.create(user.getId(), "Your Alumni registration has been rejected");
        return new UserResponse(user);
    }

    @PutMapping("/users/{id}/account-status")
    public UserResponse updateAccountStatus(@PathVariable Long id, @RequestParam AccountStatus status) {
        return new UserResponse(userService.updateAccountStatus(id, status));
    }

    @GetMapping("/mentorships")
    public Object mentorships() {
        return mentorships.findAll();
    }

    @GetMapping("/referrals")
    public Object referrals() {
        return referrals.findAll();
    }

    @GetMapping("/events")
    public Object events() {
        return events.findAll();
    }

    @GetMapping("/reports")
    public Map<String, Long> reports() {
        return stats();
    }
}
