package com.pastpupils.backend.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import com.pastpupils.backend.entity.ReferralRequest;
import com.pastpupils.backend.entity.User;
import com.pastpupils.backend.repository.ReferralRequestRepository;
import com.pastpupils.backend.repository.UserRepository;
import com.pastpupils.backend.service.AccessService;
import com.pastpupils.backend.service.NotificationService;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

class ReferralRequestControllerTest {
    private ReferralRequestRepository referrals;
    private UserRepository users;
    private NotificationService notifications;
    private AccessService access;
    private ReferralRequestController controller;
    private ReferralRequest referral;
    private User alumni;

    @BeforeEach void setUp() {
        referrals = mock(ReferralRequestRepository.class);
        users = mock(UserRepository.class);
        notifications = mock(NotificationService.class);
        access = mock(AccessService.class);
        controller = new ReferralRequestController(referrals, users, notifications, access);
        alumni = user(8L, "ALUMNI");
        referral = new ReferralRequest();
        referral.setId(15L); referral.setStudentId(3L); referral.setAlumniId(8L); referral.setStatus("PENDING");
        when(access.current()).thenReturn(alumni);
        when(access.forbidden()).thenReturn(new ResponseStatusException(403, "Access denied", null));
        when(referrals.findByIdForStatusUpdate(15L)).thenReturn(Optional.of(referral));
        when(referrals.save(referral)).thenReturn(referral);
    }

    @Test void owningAlumniApprovesPendingReferralAndNotifiesOnce() {
        ReferralRequest saved = controller.status(15L, "approved");
        assertEquals("APPROVED", saved.getStatus());
        verify(referrals).save(referral);
        verify(notifications).create(3L, "Referral request approved");
    }

    @Test void owningAlumniRejectsPendingReferralAndNotifiesOnce() {
        controller.status(15L, "REJECTED");
        assertEquals("REJECTED", referral.getStatus());
        verify(notifications).create(3L, "Referral request rejected");
    }

    @Test void processedReferralReturnsConflictWithoutSaveOrNotification() {
        referral.setStatus("APPROVED");
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> controller.status(15L, "REJECTED"));
        assertEquals(409, error.getStatusCode().value());
        verify(referrals, never()).save(any());
        verifyNoInteractions(notifications);
    }

    @Test void unrelatedAlumniCannotProcessReferral() {
        when(access.current()).thenReturn(user(9L, "ALUMNI"));
        assertThrows(ResponseStatusException.class, () -> controller.status(15L, "APPROVED"));
        verify(referrals, never()).save(any());
        verifyNoInteractions(notifications);
    }

    @Test void studentCannotProcessReferral() {
        when(access.current()).thenReturn(user(3L, "STUDENT"));
        assertThrows(ResponseStatusException.class, () -> controller.status(15L, "APPROVED"));
        verify(referrals, never()).save(any());
        verifyNoInteractions(notifications);
    }

    private User user(Long id, String role) {
        User user = new User(); user.setId(id); user.setRole(role); return user;
    }
}
