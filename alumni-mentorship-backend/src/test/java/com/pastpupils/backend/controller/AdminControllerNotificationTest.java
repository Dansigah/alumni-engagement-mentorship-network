package com.pastpupils.backend.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

import com.pastpupils.backend.entity.AccountStatus;
import com.pastpupils.backend.entity.User;
import com.pastpupils.backend.entity.VerificationStatus;
import com.pastpupils.backend.repository.*;
import com.pastpupils.backend.service.NotificationService;
import com.pastpupils.backend.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class AdminControllerNotificationTest {
    private UserService users;
    private NotificationService notifications;
    private AdminController controller;
    private User alumni;

    @BeforeEach
    void setUp() {
        users = mock(UserService.class);
        notifications = mock(NotificationService.class);
        controller = new AdminController(mock(UserRepository.class), mock(MentorshipRequestRepository.class),
                mock(ReferralRequestRepository.class), mock(EventRepository.class), users, notifications);
        alumni = new User();
        alumni.setId(20L); alumni.setName("New Alumni"); alumni.setRole("ALUMNI");
        alumni.setAccountStatus(AccountStatus.ACTIVE);
    }

    @Test
    void approvalStillNotifiesAffectedAlumni() {
        alumni.setVerificationStatus(VerificationStatus.APPROVED);
        when(users.updateVerification(20L, VerificationStatus.APPROVED)).thenReturn(alumni);

        controller.approveAlumni(20L);

        assertEquals(VerificationStatus.APPROVED, alumni.getVerificationStatus());
        verify(notifications).create(20L, "Your Alumni registration has been approved");
    }

    @Test
    void rejectionStillNotifiesAffectedAlumni() {
        alumni.setVerificationStatus(VerificationStatus.REJECTED);
        when(users.updateVerification(20L, VerificationStatus.REJECTED)).thenReturn(alumni);

        controller.rejectAlumni(20L);

        assertEquals(VerificationStatus.REJECTED, alumni.getVerificationStatus());
        verify(notifications).create(20L, "Your Alumni registration has been rejected");
    }
}
