package com.pastpupils.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import com.pastpupils.backend.entity.*;
import com.pastpupils.backend.repository.StudentProfileRepository;
import java.util.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

class StudentProfileServiceTest {
    private StudentProfileRepository profiles;
    private AccessService access;
    private StudentProfileService service;

    @BeforeEach void setUp() {
        profiles = mock(StudentProfileRepository.class);
        access = mock(AccessService.class);
        service = new StudentProfileService(profiles, access);
        when(access.current()).thenReturn(user(7L, "STUDENT"));
        when(access.forbidden()).thenReturn(new ResponseStatusException(403, "Access denied", null));
        when(profiles.save(any(StudentProfile.class))).thenAnswer(call -> call.getArgument(0));
    }

    @Test void missingProfileReturnsDefaultsWithoutWriting() {
        StudentProfile result = service.profile(7L);
        assertEquals(7L, result.getUserId());
        assertNull(result.getId());
        assertNull(result.getBio());
        assertTrue(result.getSkills().isEmpty());
        verify(profiles, never()).save(any());
    }

    @Test void firstSaveUsesOwnerAndTrimsAllText() {
        StudentProfile input = valid();
        input.setId(999L); input.setUserId(999L);
        StudentProfile result = service.saveProfile(7L, input);
        assertNull(result.getId());
        assertEquals(7L, result.getUserId());
        assertEquals("Software Engineering", result.getCourseProgram());
        assertEquals("Computing", result.getDepartment());
        assertEquals("Backend development", result.getCareerInterests());
        assertEquals("Student developer", result.getBio());
        assertEquals(Set.of("Java"), result.getSkills());
        assertNull(result.getLinkedinUrl());
        verify(profiles).save(result);
    }

    @Test void updateKeepsIdentityAndReplacesSkills() {
        StudentProfile existing = valid();
        existing.setId(11L); existing.setUserId(7L);
        when(profiles.findByUserId(7L)).thenReturn(Optional.of(existing));
        StudentProfile input = valid(); input.setSkills(new LinkedHashSet<>(Set.of("SQL")));
        StudentProfile result = service.saveProfile(7L, input);
        assertEquals(11L, result.getId());
        assertEquals(Set.of("SQL"), result.getSkills());
        assertSame(existing, service.profile(7L));
    }

    @Test void anotherStudentCannotRead() {
        assertThrows(ResponseStatusException.class, () -> service.profile(8L));
        verifyNoInteractions(profiles);
    }

    @Test void anotherStudentCannotWrite() {
        assertThrows(ResponseStatusException.class, () -> service.saveProfile(8L, valid()));
        verifyNoInteractions(profiles);
    }

    @Test void alumniCannotReadOrWrite() {
        when(access.current()).thenReturn(user(7L, "ALUMNI"));
        assertThrows(ResponseStatusException.class, () -> service.profile(7L));
        assertThrows(ResponseStatusException.class, () -> service.saveProfile(7L, valid()));
        verifyNoInteractions(profiles);
    }

    @Test void adminCannotReadOrWriteStudentExtension() {
        when(access.current()).thenReturn(user(7L, "ADMIN"));
        assertThrows(ResponseStatusException.class, () -> service.profile(7L));
        assertThrows(ResponseStatusException.class, () -> service.saveProfile(7L, valid()));
        verifyNoInteractions(profiles);
    }

    @Test void blankCoreFieldRejected() {
        StudentProfile input = valid(); input.setCourseProgram("   ");
        assertThrows(IllegalArgumentException.class, () -> service.saveProfile(7L, input));
        verify(profiles, never()).save(any());
    }

    @Test void invalidJoiningYearRejected() {
        StudentProfile input = valid(); input.setJoiningYear(0);
        assertThrows(IllegalArgumentException.class, () -> service.saveProfile(7L, input));
    }

    @Test void futureJoiningYearRejected() {
        StudentProfile input = valid(); input.setJoiningYear(9999);
        assertThrows(IllegalArgumentException.class, () -> service.saveProfile(7L, input));
    }

    @Test void duplicateSkillsIgnoringCaseAndWhitespaceRejected() {
        StudentProfile input = valid(); input.setSkills(new LinkedHashSet<>(List.of("Java", " java ")));
        assertThrows(IllegalArgumentException.class, () -> service.saveProfile(7L, input));
        verify(profiles, never()).save(any());
    }

    @Test void emptyAndBlankSkillsRejected() {
        StudentProfile input = valid(); input.setSkills(null);
        assertThrows(IllegalArgumentException.class, () -> service.saveProfile(7L, input));
        input.setSkills(Set.of(" "));
        assertThrows(IllegalArgumentException.class, () -> service.saveProfile(7L, input));
    }

    @Test void oversizedTextAndSkillRejected() {
        StudentProfile oversizedBio = valid(); oversizedBio.setBio("x".repeat(3001));
        assertThrows(IllegalArgumentException.class, () -> service.saveProfile(7L, oversizedBio));
        StudentProfile input = valid(); input.setSkills(Set.of("x".repeat(101)));
        StudentProfile oversizedSkill = input;
        assertThrows(IllegalArgumentException.class, () -> service.saveProfile(7L, oversizedSkill));
    }

    @Test void optionalUrlsAcceptHttpAndHttpsRejectOtherSchemes() {
        StudentProfile input = valid();
        input.setLinkedinUrl(" https://linkedin.com/in/student ");
        input.setGithubUrl("https://github.com/student");
        StudentProfile saved = service.saveProfile(7L, input);
        assertEquals("https://linkedin.com/in/student", saved.getLinkedinUrl());
        assertEquals("https://github.com/student", saved.getGithubUrl());
        input.setGithubUrl("javascript:alert(1)");
        assertThrows(IllegalArgumentException.class, () -> service.saveProfile(7L, input));
    }

    @Test void academicFieldsSaveAndReadBack() {
        StudentProfile saved = service.saveProfile(7L, valid());
        when(profiles.findByUserId(7L)).thenReturn(Optional.of(saved));
        StudentProfile loaded = service.profile(7L);
        assertEquals(2026, loaded.getJoiningYear());
        assertEquals(2027, loaded.getExpectedCompletionYear());
    }

    @Test void completionYearCanBeClearedOnExistingProfile() {
        StudentProfile existing = valid(); existing.setId(11L); existing.setUserId(7L);
        when(profiles.findByUserId(7L)).thenReturn(Optional.of(existing));
        StudentProfile input = valid(); input.setExpectedCompletionYear(null);
        StudentProfile saved = service.saveProfile(7L, input);
        assertNull(saved.getExpectedCompletionYear());
        assertEquals(11L, saved.getId());
        assertEquals(Set.of("Java"), saved.getSkills());
    }

    @Test void existingProfileWithNullAcademicFieldsStillLoads() {
        StudentProfile existing = new StudentProfile(); existing.setUserId(7L);
        when(profiles.findByUserId(7L)).thenReturn(Optional.of(existing));
        assertNull(service.profile(7L).getJoiningYear());
        assertNull(service.profile(7L).getExpectedCompletionYear());
    }
    @Test void apiRejectsInvalidYearText() throws Exception {
        var mockedService = mock(StudentProfileService.class);
        var mvc = org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup(
                new com.pastpupils.backend.controller.StudentProfileController(mockedService)).build();
        for (String body : List.of("{\"expectedCompletionYear\":\"invalid-year\"}",
                "{\"expectedCompletionYear\":\"invalid\"}", "{\"joiningYear\":\"letters\"}")) {
            mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/student-profiles/7")
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON).content(body))
                    .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isBadRequest());
        }
        verifyNoInteractions(mockedService);
    }

    @Test void apiAcceptsAndReturnsCompletionYear() throws Exception {
        var mockedService = mock(StudentProfileService.class);
        when(mockedService.saveProfile(eq(7L), any(StudentProfile.class))).thenAnswer(call -> call.getArgument(1));
        var mvc = org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup(
                new com.pastpupils.backend.controller.StudentProfileController(mockedService)).build();
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/student-profiles/7")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .content("{\"joiningYear\":2026,\"expectedCompletionYear\":2027}"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.joiningYear").value(2026))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.expectedCompletionYear").value(2027));
    }
    @Test void completionYearBeforeJoiningYearRejected() {
        StudentProfile input = valid(); input.setExpectedCompletionYear(2025);
        assertThrows(IllegalArgumentException.class, () -> service.saveProfile(7L, input));
        verify(profiles, never()).save(any());
    }

    @Test void unreasonableCompletionYearsRejected() {
        for (int year : new int[] {0, 999, 10000, 9999}) {
            StudentProfile input = valid(); input.setExpectedCompletionYear(year);
            assertThrows(IllegalArgumentException.class, () -> service.saveProfile(7L, input));
        }
        verify(profiles, never()).save(any());
    }
    private StudentProfile valid() {
        StudentProfile input = new StudentProfile();
        input.setCourseProgram(" Software Engineering ");
        input.setDepartment(" Computing ");
        input.setJoiningYear(2026);
        input.setExpectedCompletionYear(2027);
        input.setCareerInterests(" Backend development ");
        input.setBio(" Student developer ");
        input.setSkills(new LinkedHashSet<>(Set.of(" Java ")));
        return input;
    }

    private User user(Long id, String role) {
        User user = new User(); user.setId(id); user.setRole(role); return user;
    }
}
