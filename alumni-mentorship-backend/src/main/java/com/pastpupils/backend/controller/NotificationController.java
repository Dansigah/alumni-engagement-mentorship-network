package com.pastpupils.backend.controller;

import com.pastpupils.backend.entity.Notification;
import com.pastpupils.backend.service.*;
import java.util.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService service;
    private final AccessService access;

    public NotificationController(NotificationService service, AccessService access) {
        this.service = service;
        this.access = access;
    }

    @GetMapping("/user/{userId}")
    public List<Notification> user(@PathVariable Long userId) {
        access.requireSelfOrAdmin(userId);
        return service.user(userId);
    }

    @GetMapping("/user/{userId}/unread-count")
    public Map<String, Long> unread(@PathVariable Long userId) {
        access.requireSelfOrAdmin(userId);
        return Map.of("count", service.unread(userId));
    }

    @PutMapping("/{id}/read")
    public Notification read(@PathVariable Long id) {
        Notification n = service.get(id);
        access.requireSelfOrAdmin(n.getUserId());
        return service.read(id);
    }
}
