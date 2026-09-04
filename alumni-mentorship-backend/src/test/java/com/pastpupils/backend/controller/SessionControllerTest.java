package com.pastpupils.backend.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import com.pastpupils.backend.entity.MentorshipSession;
import com.pastpupils.backend.entity.User;
import com.pastpupils.backend.entity.AccountStatus;
import com.pastpupils.backend.entity.MentorshipRequest;
import com.pastpupils.backend.entity.VerificationStatus;
import java.util.List;
import com.pastpupils.backend.repository.MentorshipRequestRepository;
import com.pastpupils.backend.repository.MentorshipSessionRepository;
import com.pastpupils.backend.repository.UserRepository;
import com.pastpupils.backend.service.AccessService;
import com.pastpupils.backend.service.NotificationService;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

class SessionControllerTest {
    private MentorshipSessionRepository sessions;
    private MentorshipRequestRepository mentorships;
    private UserRepository users;
    private AccessService access;
    private NotificationService notifications;
    private SessionController controller;
    private User alumni;

    @BeforeEach void setUp() {
        sessions = mock(MentorshipSessionRepository.class);
        mentorships = mock(MentorshipRequestRepository.class);
        users = mock(UserRepository.class);
        access = mock(AccessService.class);
        notifications = mock(NotificationService.class);
        controller = new SessionController(sessions, mentorships, users, access, notifications);
        when(access.forbidden()).thenReturn(new ResponseStatusException(403, "Access denied", null));
        alumni = user(8L, "ALUMNI", "Thamil");
        when(access.current()).thenReturn(alumni);
        when(users.findById(8L)).thenReturn(Optional.of(alumni));
        when(users.findById(3L)).thenReturn(Optional.of(user(3L, "STUDENT", "Thivi")));
        when(sessions.save(any(MentorshipSession.class))).thenAnswer(call -> call.getArgument(0));
    }

    @Test void acceptedMentorshipCanCreateSession() {
        when(mentorships.existsByStudentIdAndAlumniIdAndStatus(3L, 8L, "ACCEPTED")).thenReturn(true);
        MentorshipSession saved = controller.create(onlineSession());
        assertEquals("SCHEDULED", saved.getStatus());
        assertEquals("ONLINE", saved.getMode());
        verify(notifications).create(eq(3L), contains("Thamil scheduled a mentorship session: Java Career Guidance"));
    }

    @Test void alumniCanAccessOnlyOwnAcceptedStudents() {
        MentorshipRequest ownAccepted = request(3L, 8L, "ACCEPTED");
        MentorshipRequest ownPending = request(4L, 8L, "PENDING");
        when(mentorships.findByAlumniId(8L)).thenReturn(List.of(ownAccepted, ownPending));

        List<com.pastpupils.backend.dto.UserResponse> result = controller.acceptedStudents();

        assertEquals(1, result.size());
        assertEquals(3L, result.get(0).id);
        verify(mentorships).findByAlumniId(8L);
        verify(mentorships, never()).findByAlumniId(9L);
    }

    @Test void alumniRoleMatchingIsCaseAndWhitespaceSafe() {
        alumni.setRole(" Alumni ");
        when(mentorships.findByAlumniId(8L)).thenReturn(List.of());
        assertDoesNotThrow(() -> controller.acceptedStudents());
    }

    @Test void studentCannotAccessAcceptedStudents() {
        when(access.current()).thenReturn(user(3L, "STUDENT", "Thivi"));
        when(access.forbidden()).thenReturn(new ResponseStatusException(403, "Access denied", null));
        assertThrows(ResponseStatusException.class, () -> controller.acceptedStudents());
        verifyNoInteractions(mentorships);
    }

    @Test void suspendedOrRejectedAlumniCannotAccessAcceptedStudents() {
        alumni.setAccountStatus(AccountStatus.SUSPENDED);
        assertThrows(ResponseStatusException.class, () -> controller.acceptedStudents());
        alumni.setAccountStatus(AccountStatus.ACTIVE);
        alumni.setVerificationStatus(VerificationStatus.REJECTED);
        assertThrows(ResponseStatusException.class, () -> controller.acceptedStudents());
        verifyNoInteractions(mentorships);
    }

    @Test void loggedInUserCanReadOwnSessionList() {
        when(sessions.findByStudentIdOrAlumniId(8L, 8L)).thenReturn(List.of());
        assertDoesNotThrow(() -> controller.user(8L));
        verify(access).requireSelfOrAdmin(8L);
    }

    @Test void nonAcceptedMentorshipCannotCreateSession() {
        RuntimeException error = assertThrows(RuntimeException.class, () -> controller.create(onlineSession()));
        assertEquals("An accepted mentorship is required before scheduling a session", error.getMessage());
        verify(sessions, never()).save(any());
    }

    @Test void unrelatedAlumniCannotScheduleSession() {
        when(access.current()).thenReturn(user(9L, "ALUMNI", "Other"));
        when(access.forbidden()).thenReturn(new ResponseStatusException(403, "Access denied", null));
        assertThrows(ResponseStatusException.class, () -> controller.create(onlineSession()));
        verify(sessions, never()).save(any());
    }

    @Test void studentCannotScheduleSession() {
        when(access.current()).thenReturn(user(3L, "STUDENT", "Thivi"));
        when(access.forbidden()).thenReturn(new ResponseStatusException(403, "Access denied", null));
        assertThrows(ResponseStatusException.class, () -> controller.create(onlineSession()));
        verify(sessions, never()).save(any());
    }

    @Test void scheduledSessionCanBeCompletedOnce() {
        MentorshipSession session = onlineSession(); session.setId(20L); session.setStatus("SCHEDULED");
        when(sessions.findByIdForStatusUpdate(20L)).thenReturn(Optional.of(session));
        MentorshipSession saved = controller.status(20L, "completed");
        assertEquals("COMPLETED", saved.getStatus());
        verify(notifications).create(3L, "Your mentorship session with Thamil was marked as completed.");
    }

    @Test void onlineSessionRequiresValidMeetingLink() {
        when(mentorships.existsByStudentIdAndAlumniIdAndStatus(3L, 8L, "ACCEPTED")).thenReturn(true);
        MentorshipSession session = onlineSession(); session.setMeetingLink("");
        RuntimeException error = assertThrows(RuntimeException.class, () -> controller.create(session));
        assertEquals("A valid meeting link is required for online sessions", error.getMessage());
    }

    @Test void physicalSessionRequiresVenue() {
        when(mentorships.existsByStudentIdAndAlumniIdAndStatus(3L, 8L, "ACCEPTED")).thenReturn(true);
        MentorshipSession session = onlineSession(); session.setMode("PHYSICAL"); session.setVenue(" ");
        RuntimeException error = assertThrows(RuntimeException.class, () -> controller.create(session));
        assertEquals("A venue is required for physical sessions", error.getMessage());
    }

    private MentorshipSession onlineSession() {
        MentorshipSession session = new MentorshipSession();
        session.setStudentId(3L); session.setAlumniId(8L);
        session.setTopic("Java Career Guidance");
        session.setSessionDate(LocalDateTime.of(2026, 9, 10, 0, 0));
        session.setSessionTime(LocalTime.of(15, 30));
        session.setMode("ONLINE"); session.setMeetingLink("https://meet.example/session");
        return session;
    }

    private User user(Long id, String role, String name) {
        User user = new User(); user.setId(id); user.setRole(role); user.setName(name);
        user.setAccountStatus(AccountStatus.ACTIVE);
        user.setVerificationStatus(VerificationStatus.APPROVED);
        return user;
    }

    private MentorshipRequest request(Long studentId, Long alumniId, String status) {
        MentorshipRequest request = new MentorshipRequest();
        request.setStudentId(studentId); request.setAlumniId(alumniId); request.setStatus(status);
        return request;
    }
}
