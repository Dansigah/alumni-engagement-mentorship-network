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

    @Test
    void customStudentMessageIsSavedAndReturnedToAlumniUnchanged() {
        User student = user(3L, "STUDENT", "Student");
        when(access.requireRole("STUDENT")).thenReturn(student);
        String message = "I would like Java and Spring Boot guidance.\nPlease help me prepare for internships.";
        request.setMessage(message);
        MentorshipRequest saved = controller.create(request);
        assertEquals(message, saved.getMessage());
        assertEquals("PENDING", saved.getStatus());
        verify(requests).save(request);
        when(requests.findByAlumniId(8L)).thenReturn(java.util.List.of(saved));
        assertEquals(message, controller.alumni(8L).get(0).getMessage());
        verify(access).requireSelfOrAdmin(8L);
    }
    @Test
    void nullMessageIsRejected() throws Exception {
        assertInvalidMessage(null);
    }

    @Test
    void emptyMessageIsRejected() throws Exception {
        assertInvalidMessage("");
    }

    @Test
    void whitespaceOnlyMessageIsRejected() throws Exception {
        assertInvalidMessage("     ");
    }

    @Test
    void messageOver2000CharactersIsRejected() throws Exception {
        assertInvalidMessage("a".repeat(2001));
    }

    private void assertInvalidMessage(String message) throws Exception {
        when(access.requireRole("STUDENT")).thenReturn(user(3L, "STUDENT", "Student"));
        var mvc = org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new ApiExceptionHandler()).build();
        var payload = new java.util.HashMap<String, Object>();
        payload.put("studentId", 3L);
        payload.put("alumniId", 8L);
        payload.put("message", message);
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/mentorships")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .content(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(payload)))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isBadRequest());
        verify(requests, never()).save(any());
        verifyNoInteractions(notifications);
    }

    @Test
    void surroundingWhitespaceIsTrimmedBeforePersistence() {
        when(access.requireRole("STUDENT")).thenReturn(user(3L, "STUDENT", "Student"));
        String message = "Java guidance.\nPlease help with internships.";
        request.setMessage(" \t" + message + "\n ");

        assertEquals(message, controller.create(request).getMessage());
        verify(requests).save(argThat(saved -> message.equals(saved.getMessage())));
        verify(notifications).create(8L, "New mentorship request received");
    }

    @Test
    void exactly2000CharactersAfterTrimmingAreAccepted() {
        when(access.requireRole("STUDENT")).thenReturn(user(3L, "STUDENT", "Student"));
        String message = "a".repeat(2000);
        request.setMessage(" " + message + " ");

        assertEquals(message, controller.create(request).getMessage());
        assertEquals("PENDING", request.getStatus());
        verify(requests).save(request);
        verify(notifications).create(8L, "New mentorship request received");
    }

    private User user(Long id, String role, String name) {
        User user = new User();
        user.setId(id);
        user.setRole(role);
        user.setName(name);
        return user;
    }
}
