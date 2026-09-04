package com.pastpupils.backend.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.pastpupils.backend.entity.AccountStatus;
import com.pastpupils.backend.entity.User;
import com.pastpupils.backend.entity.VerificationStatus;
import com.pastpupils.backend.service.*;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class UserControllerNotificationTest {
    private UserService users;
    private NotificationService notifications;
    private UserController controller;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        users = mock(UserService.class);
        notifications = mock(NotificationService.class);
        controller = new UserController(users, mock(JwtService.class), mock(AccessService.class),
                mock(AlumniProfileService.class), notifications);
        mvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void frontendRegistrationPathNotifiesEachActiveAdminOnce() throws Exception {
        User alumni = user(20L, "New Alumni", "ALUMNI", AccountStatus.ACTIVE, VerificationStatus.PENDING);
        User activeAdmin = user(1L, "Admin", "ADMIN", AccountStatus.ACTIVE, VerificationStatus.APPROVED);
        User suspendedAdmin = user(2L, "Suspended Admin", "ADMIN", AccountStatus.SUSPENDED, VerificationStatus.APPROVED);
        when(users.create(any(User.class))).thenReturn(alumni);
        when(users.byRole("ADMIN")).thenReturn(List.of(activeAdmin, suspendedAdmin));

        mvc.perform(post("/api/users/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"New Alumni\",\"email\":\"new@example.com\",\"password\":\"secret1\",\"role\":\"ALUMNI\"}"))
                .andExpect(status().isCreated());

        assertEquals(VerificationStatus.PENDING, alumni.getVerificationStatus());
        verify(notifications, times(1)).create(1L, "New Alumni registration awaiting approval: New Alumni");
        verify(notifications, never()).create(eq(2L), anyString());
    }

    @Test
    void frontendRegistrationPathDoesNotNotifyAdminForStudent() throws Exception {
        User student = user(21L, "New Student", "STUDENT", AccountStatus.ACTIVE, VerificationStatus.APPROVED);
        when(users.create(any(User.class))).thenReturn(student);

        mvc.perform(post("/api/users/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"New Student\",\"email\":\"student@example.com\",\"password\":\"secret1\",\"role\":\"STUDENT\"}"))
                .andExpect(status().isCreated());

        assertEquals(VerificationStatus.APPROVED, student.getVerificationStatus());
        verify(users, never()).byRole("ADMIN");
        verifyNoInteractions(notifications);
    }

    @Test
    void approvedAlumniRegistrationDoesNotCreatePendingNotification() {
        User alumni = user(22L, "Approved Alumni", "ALUMNI", AccountStatus.ACTIVE, VerificationStatus.APPROVED);
        when(users.create(alumni)).thenReturn(alumni);

        controller.register(alumni);

        verify(users, never()).byRole("ADMIN");
        verifyNoInteractions(notifications);
    }

    private User user(Long id, String name, String role, AccountStatus account, VerificationStatus verification) {
        User user = new User();
        user.setId(id); user.setName(name); user.setEmail(name.replace(" ", "").toLowerCase() + "@example.com");
        user.setRole(role); user.setAccountStatus(account); user.setVerificationStatus(verification);
        return user;
    }
}
