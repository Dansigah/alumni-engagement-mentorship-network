package com.pastpupils.backend.service;

import com.pastpupils.backend.entity.Notification;
import com.pastpupils.backend.repository.NotificationRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class NotificationService {
    private final NotificationRepository repo;

    public NotificationService(NotificationRepository repo) {
        this.repo = repo;
    }

    public Notification create(Long userId, String message) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setMessage(message);
        return repo.save(n);
    }

    public Notification get(Long id) {
        return repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
    }

    public List<Notification> user(Long id) {
        return repo.findByUserIdOrderByCreatedAtDesc(id);
    }

    public long unread(Long id) {
        return repo.countByUserIdAndReadStatusFalse(id);
    }

    public Notification read(Long id) {
        Notification n = get(id);
        n.setReadStatus(true);
        return repo.save(n);
    }
}
