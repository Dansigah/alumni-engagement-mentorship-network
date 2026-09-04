package com.pastpupils.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import com.pastpupils.backend.entity.*;
import com.pastpupils.backend.repository.*;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

class AlumniProfileServiceTest {
    private AlumniProfileRepository profiles;
    private AlumniSkillRepository skills;
    private EmploymentHistoryRepository employment;
    private UserRepository users;
    private AccessService access;
    private AlumniProfileService service;
    private User alumni;

    @BeforeEach void setUp() {
        profiles = mock(AlumniProfileRepository.class);
        skills = mock(AlumniSkillRepository.class);
        employment = mock(EmploymentHistoryRepository.class);
        users = mock(UserRepository.class);
        access = mock(AccessService.class);
        service = new AlumniProfileService(profiles, skills, employment, users, access);
        alumni = user(7L, "ALUMNI");
        when(users.findById(7L)).thenReturn(Optional.of(alumni));
        when(access.current()).thenReturn(alumni);
        when(profiles.save(any(AlumniProfile.class))).thenAnswer(call -> call.getArgument(0));
        when(skills.save(any(AlumniSkill.class))).thenAnswer(call -> call.getArgument(0));
        when(employment.save(any(EmploymentHistory.class))).thenAnswer(call -> call.getArgument(0));
    }

    @Test void ownerCanCreateAndUpdateProfessionalProfile() {
        AlumniProfile input = new AlumniProfile();
        input.setProfessionalTitle(" Software Engineer ");
        input.setYearsOfExperience(4);
        input.setLinkedinUrl("https://linkedin.com/in/test");
        AlumniProfile saved = service.saveProfile(7L, input);
        assertEquals(7L, saved.getUserId());
        assertEquals("Software Engineer", saved.getProfessionalTitle());
        assertEquals(4, saved.getYearsOfExperience());
    }

    @Test void anotherUserCannotEditProfile() {
        when(access.current()).thenReturn(user(8L, "ALUMNI"));
        when(access.forbidden()).thenReturn(new ResponseStatusException(403, "Access denied", null));
        assertThrows(ResponseStatusException.class, () -> service.saveProfile(7L, new AlumniProfile()));
        verify(profiles, never()).save(any());
    }

    @Test void ownerCanAddAndRemoveSkill() {
        AlumniSkill input = new AlumniSkill(); input.setName(" Java ");
        AlumniSkill saved = service.addSkill(7L, input);
        assertEquals("Java", saved.getName()); assertEquals(7L, saved.getAlumniId());
        saved.setId(12L); when(skills.findById(12L)).thenReturn(Optional.of(saved));
        service.deleteSkill(12L); verify(skills).delete(saved);
    }

    @Test void ownerCanAddAndDeleteEmployment() {
        EmploymentHistory input = new EmploymentHistory();
        input.setCompanyName("Acme"); input.setJobTitle("Developer");
        input.setStartDate(LocalDate.of(2024, 1, 1)); input.setCurrentlyWorking(true);
        EmploymentHistory saved = service.addEmployment(7L, input);
        assertEquals(7L, saved.getAlumniId()); assertNull(saved.getEndDate());
        saved.setId(13L); when(employment.findById(13L)).thenReturn(Optional.of(saved));
        service.deleteEmployment(13L); verify(employment).delete(saved);
    }

    @Test void ownerCanUpdateMentoringAvailability() {
        AlumniProfile existing = new AlumniProfile(); existing.setUserId(7L);
        when(profiles.findByUserId(7L)).thenReturn(Optional.of(existing));
        AlumniProfile saved = service.updateAvailability(7L, true, " Weekends ");
        assertTrue(saved.isMentoringAvailable()); assertEquals("Weekends", saved.getAvailabilityNote());
    }

    private User user(Long id, String role) {
        User user = new User(); user.setId(id); user.setRole(role);
        user.setVerificationStatus(VerificationStatus.APPROVED);
        user.setAccountStatus(AccountStatus.ACTIVE); return user;
    }
}
