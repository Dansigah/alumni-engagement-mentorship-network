package com.pastpupils.backend.service;

import com.pastpupils.backend.dto.UserResponse;
import com.pastpupils.backend.entity.*;
import com.pastpupils.backend.repository.*;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AlumniProfileService {
    private final AlumniProfileRepository profiles;
    private final AlumniSkillRepository skills;
    private final EmploymentHistoryRepository employment;
    private final UserRepository users;
    private final AccessService access;

    public AlumniProfileService(AlumniProfileRepository profiles, AlumniSkillRepository skills,
            EmploymentHistoryRepository employment, UserRepository users, AccessService access) {
        this.profiles = profiles;
        this.skills = skills;
        this.employment = employment;
        this.users = users;
        this.access = access;
    }

    public AlumniProfile profile(Long alumniId) {
        requireReadAccess(alumniId);
        return profiles.findByUserId(alumniId).orElseGet(() -> emptyProfile(alumniId));
    }

    public AlumniProfile saveProfile(Long alumniId, AlumniProfile input) {
        requireOwner(alumniId);
        if (input.getYearsOfExperience() != null && input.getYearsOfExperience() < 0) {
            throw new RuntimeException("Years of experience cannot be negative");
        }
        String url = clean(input.getLinkedinUrl());
        if (url != null && !url.matches("^https?://.+")) {
            throw new RuntimeException("LinkedIn URL must start with http:// or https://");
        }
        AlumniProfile target = profiles.findByUserId(alumniId).orElseGet(() -> emptyProfile(alumniId));
        target.setProfessionalTitle(clean(input.getProfessionalTitle()));
        target.setCurrentCompany(clean(input.getCurrentCompany()));
        target.setCurrentPosition(clean(input.getCurrentPosition()));
        target.setIndustry(clean(input.getIndustry()));
        target.setYearsOfExperience(input.getYearsOfExperience());
        target.setLocation(clean(input.getLocation()));
        target.setProfessionalSummary(clean(input.getProfessionalSummary()));
        target.setLinkedinUrl(url);
        target.setMentoringAvailable(input.isMentoringAvailable());
        target.setAvailabilityNote(clean(input.getAvailabilityNote()));
        return profiles.save(target);
    }

    public AlumniProfile updateAvailability(Long alumniId, boolean available, String note) {
        requireOwner(alumniId);
        AlumniProfile target = profiles.findByUserId(alumniId).orElseGet(() -> emptyProfile(alumniId));
        target.setMentoringAvailable(available);
        target.setAvailabilityNote(clean(note));
        return profiles.save(target);
    }

    public List<AlumniSkill> skills(Long alumniId) {
        requireReadAccess(alumniId);
        return skills.findByAlumniIdOrderByNameAsc(alumniId);
    }

    public AlumniSkill addSkill(Long alumniId, AlumniSkill input) {
        requireOwner(alumniId);
        String name = clean(input.getName());
        if (name == null) throw new RuntimeException("Skill name is required");
        if (skills.existsByAlumniIdAndNameIgnoreCase(alumniId, name)) {
            throw new RuntimeException("Skill already exists");
        }
        AlumniSkill skill = new AlumniSkill();
        skill.setAlumniId(alumniId);
        skill.setName(name);
        return skills.save(skill);
    }

    public void deleteSkill(Long skillId) {
        AlumniSkill skill = skills.findById(skillId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Skill not found"));
        requireOwner(skill.getAlumniId());
        skills.delete(skill);
    }

    public List<EmploymentHistory> employment(Long alumniId) {
        requireReadAccess(alumniId);
        return employment.findByAlumniIdOrderByStartDateDesc(alumniId);
    }

    public EmploymentHistory addEmployment(Long alumniId, EmploymentHistory input) {
        requireOwner(alumniId);
        EmploymentHistory item = new EmploymentHistory();
        copyEmployment(input, item, alumniId);
        return employment.save(item);
    }

    public EmploymentHistory updateEmployment(Long id, EmploymentHistory input) {
        EmploymentHistory item = employment.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employment record not found"));
        requireOwner(item.getAlumniId());
        copyEmployment(input, item, item.getAlumniId());
        return employment.save(item);
    }

    public void deleteEmployment(Long id) {
        EmploymentHistory item = employment.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employment record not found"));
        requireOwner(item.getAlumniId());
        employment.delete(item);
    }

    public UserResponse enrich(UserResponse response) {
        profiles.findByUserId(response.id).ifPresent(profile -> {
            response.professionalTitle = profile.getProfessionalTitle();
            response.currentCompany = profile.getCurrentCompany();
            response.currentPosition = profile.getCurrentPosition();
            response.industry = profile.getIndustry();
            response.yearsOfExperience = profile.getYearsOfExperience();
            response.location = profile.getLocation();
            response.mentoringAvailable = profile.isMentoringAvailable();
        });
        response.skills = skills.findByAlumniIdOrderByNameAsc(response.id).stream()
                .map(AlumniSkill::getName).toList();
        return response;
    }

    private void copyEmployment(EmploymentHistory source, EmploymentHistory target, Long alumniId) {
        String company = clean(source.getCompanyName());
        String title = clean(source.getJobTitle());
        if (company == null || title == null || source.getStartDate() == null) {
            throw new RuntimeException("Company, job title, and start date are required");
        }
        if (!source.isCurrentlyWorking() && source.getEndDate() != null
                && source.getEndDate().isBefore(source.getStartDate())) {
            throw new RuntimeException("End date cannot be before start date");
        }
        target.setAlumniId(alumniId);
        target.setCompanyName(company);
        target.setJobTitle(title);
        target.setStartDate(source.getStartDate());
        target.setCurrentlyWorking(source.isCurrentlyWorking());
        target.setEndDate(source.isCurrentlyWorking() ? null : source.getEndDate());
        target.setDescription(clean(source.getDescription()));
    }

    private void requireOwner(Long alumniId) {
        User target = requireAlumni(alumniId);
        User current = access.current();
        if (!"ALUMNI".equals(current.getRole()) || !current.getId().equals(target.getId())) {
            throw access.forbidden();
        }
    }

    private void requireReadAccess(Long alumniId) {
        User target = requireAlumni(alumniId);
        User current = access.current();
        if ("ADMIN".equals(current.getRole()) || current.getId().equals(alumniId)) return;
        if ("STUDENT".equals(current.getRole())
                && target.getVerificationStatus() == VerificationStatus.APPROVED
                && target.getAccountStatus() == AccountStatus.ACTIVE) return;
        throw access.forbidden();
    }

    private User requireAlumni(Long id) {
        User user = users.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alumni not found"));
        if (!"ALUMNI".equals(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Alumni not found");
        }
        return user;
    }

    private AlumniProfile emptyProfile(Long alumniId) {
        AlumniProfile profile = new AlumniProfile();
        profile.setUserId(alumniId);
        return profile;
    }

    private String clean(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }
}
