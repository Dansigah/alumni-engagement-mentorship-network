package com.pastpupils.backend.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.pastpupils.backend.entity.MentorshipRequest;
import com.pastpupils.backend.entity.User;
import com.pastpupils.backend.repository.MentorshipRequestRepository;
import com.pastpupils.backend.repository.UserRepository;
import com.pastpupils.backend.service.AccessService;
import com.pastpupils.backend.service.NotificationService;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

class MentorshipRequestControllerTest {
    private MentorshipRequestRepository requests;
    private UserRepository users;
    private NotificationService notifications;
    private AccessService access;
    private MentorshipRequestController controller;
    private MentorshipRequest request;
    private User alumni;

    @BeforeEach
    void setUp() {
        requests = mock(MentorshipRequestRepository.class);
        users = mock(UserRepository.class);
        notifications = mock(NotificationService.class);
        access = mock(AccessService.class);
        controller = new MentorshipRequestController(requests, users, notifications, access);

        request = new MentorshipRequest();
        request.setId(12L);
        request.setStudentId(3L);
        request.setAlumniId(8L);
        request.setStatus("PENDING");
        alumni = user(8L, "ALUMNI", "Thamil");
        when(requests.findByIdForStatusUpdate(12L)).thenReturn(Optional.of(request));
        when(requests.save(request)).thenReturn(request);
        when(users.findById(8L)).thenReturn(Optional.of(alumni));
        when(access.current()).thenReturn(alumni);
    }

    @Test
    void owningAlumniAcceptsPendingRequestAndStudentIsNotifiedOnce() {
        MentorshipRequest saved = controller.status(12L, "accepted");

        assertEquals("ACCEPTED", saved.getStatus());
        verify(requests).save(request);
        verify(notifications).create(3L, "Your mentorship request to Thamil has been accepted.");
    }

    @Test
    void owningAlumniRejectsPendingRequestAndStudentIsNotifiedOnce() {
        controller.status(12L, "REJECTED");

        assertEquals("REJECTED", request.getStatus());
        verify(notifications).create(3L, "Your mentorship request to Thamil has been rejected.");
    }

    @Test
    void anotherAlumniCannotProcessRequest() {
        when(access.current()).thenReturn(user(9L, "ALUMNI", "Other"));
        when(access.forbidden()).thenReturn(new ResponseStatusException(403, "Access denied", null));

        assertThrows(ResponseStatusException.class, () -> controller.status(12L, "ACCEPTED"));
        verify(requests, never()).save(any());
        verifyNoInteractions(notifications);
    }

    @Test
    void processedRequestCannotBeProcessedAgainOrNotifyTwice() {
        request.setStatus("ACCEPTED");

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> controller.status(12L, "REJECTED"));

        assertEquals(409, error.getStatusCode().value());
        verify(requests, never()).save(any());
        verifyNoInteractions(notifications);
    }

    private User user(Long id, String role, String name) {
        User user = new User();
        user.setId(id);
        user.setRole(role);
        user.setName(name);
        return user;
    }
}
