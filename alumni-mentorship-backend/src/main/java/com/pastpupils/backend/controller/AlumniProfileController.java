package com.pastpupils.backend.controller;

import com.pastpupils.backend.dto.MentoringAvailabilityRequest;
import com.pastpupils.backend.entity.*;
import com.pastpupils.backend.service.AlumniProfileService;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/alumni-profiles")
public class AlumniProfileController {
    private final AlumniProfileService service;

    public AlumniProfileController(AlumniProfileService service) {
        this.service = service;
    }

    @GetMapping("/{alumniId}")
    public AlumniProfile profile(@PathVariable Long alumniId) {
        return service.profile(alumniId);
    }

    @PutMapping("/{alumniId}")
    public AlumniProfile saveProfile(@PathVariable Long alumniId, @RequestBody AlumniProfile profile) {
        return service.saveProfile(alumniId, profile);
    }

    @PutMapping("/{alumniId}/availability")
    public AlumniProfile availability(@PathVariable Long alumniId,
            @RequestBody MentoringAvailabilityRequest request) {
        return service.updateAvailability(alumniId, request.mentoringAvailable, request.availabilityNote);
    }

    @GetMapping("/{alumniId}/skills")
    public List<AlumniSkill> skills(@PathVariable Long alumniId) {
        return service.skills(alumniId);
    }

    @PostMapping("/{alumniId}/skills")
    public AlumniSkill addSkill(@PathVariable Long alumniId, @RequestBody AlumniSkill skill) {
        return service.addSkill(alumniId, skill);
    }

    @DeleteMapping("/skills/{skillId}")
    public Map<String, String> deleteSkill(@PathVariable Long skillId) {
        service.deleteSkill(skillId);
        return Map.of("message", "Skill removed successfully");
    }

    @GetMapping("/{alumniId}/employment")
    public List<EmploymentHistory> employment(@PathVariable Long alumniId) {
        return service.employment(alumniId);
    }

    @PostMapping("/{alumniId}/employment")
    public EmploymentHistory addEmployment(@PathVariable Long alumniId,
            @RequestBody EmploymentHistory employment) {
        return service.addEmployment(alumniId, employment);
    }

    @PutMapping("/employment/{employmentId}")
    public EmploymentHistory updateEmployment(@PathVariable Long employmentId,
            @RequestBody EmploymentHistory employment) {
        return service.updateEmployment(employmentId, employment);
    }

    @DeleteMapping("/employment/{employmentId}")
    public Map<String, String> deleteEmployment(@PathVariable Long employmentId) {
        service.deleteEmployment(employmentId);
        return Map.of("message", "Employment record deleted successfully");
    }
}
