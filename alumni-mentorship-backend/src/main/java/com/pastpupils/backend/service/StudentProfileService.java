package com.pastpupils.backend.service;

import com.pastpupils.backend.entity.StudentProfile;
import com.pastpupils.backend.entity.User;
import com.pastpupils.backend.repository.StudentProfileRepository;
import java.net.URI;
import java.time.Year;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StudentProfileService {
    private final StudentProfileRepository profiles;
    private final AccessService access;

    public StudentProfileService(StudentProfileRepository profiles, AccessService access) {
        this.profiles = profiles;
        this.access = access;
    }

    @Transactional(readOnly = true)
    public StudentProfile profile(Long userId) {
        requireOwner(userId);
        return profiles.findByUserId(userId).orElseGet(() -> emptyProfile(userId));
    }

    @Transactional
    public StudentProfile saveProfile(Long userId, StudentProfile input) {
        requireOwner(userId);
        String course = required(input.getCourseProgram(), 255, "Course / Program");
        String department = required(input.getDepartment(), 255, "Department");
        Integer joiningYear = input.getJoiningYear();
        if (joiningYear == null || joiningYear < 1900 || joiningYear > Year.now().getValue() + 1)
            throw new IllegalArgumentException("Joining Year must be a four-digit year between 1900 and " + (Year.now().getValue() + 1));
        Integer completionYear = input.getExpectedCompletionYear();
        if (completionYear != null && (completionYear < 1900 || completionYear > Year.now().getValue() + 15))
            throw new IllegalArgumentException("Expected Completion Year must be a four-digit year between 1900 and " + (Year.now().getValue() + 15));
        if (completionYear != null && completionYear < joiningYear)
            throw new IllegalArgumentException("Expected Completion Year cannot be earlier than Joining Year");
        String interests = required(input.getCareerInterests(), 2000, "Career interests");
        String bio = required(input.getBio(), 3000, "Bio / About");
        String linkedin = url(input.getLinkedinUrl(), "LinkedIn");
        String github = url(input.getGithubUrl(), "GitHub");
        Set<String> skills = new LinkedHashSet<>();
        Set<String> keys = new LinkedHashSet<>();
        if (input.getSkills() != null) {
            for (String value : input.getSkills()) {
                String name = required(value, 100, "Skill");
                if (!keys.add(name.toLowerCase(Locale.ROOT)))
                    throw new IllegalArgumentException("Duplicate skills are not allowed");
                skills.add(name);
            }
        }
        if (skills.isEmpty()) throw new IllegalArgumentException("Add at least one skill");

        StudentProfile target = profiles.findByUserId(userId).orElseGet(() -> emptyProfile(userId));
        target.setCourseProgram(course);
        target.setDepartment(department);
        target.setJoiningYear(joiningYear);
        target.setExpectedCompletionYear(input.getExpectedCompletionYear());
        target.setCareerInterests(interests);
        target.setBio(bio);
        target.setLinkedinUrl(linkedin);
        target.setGithubUrl(github);
        target.getSkills().clear();
        target.getSkills().addAll(skills);
        return profiles.save(target);
    }

    private void requireOwner(Long userId) {
        User current = access.current();
        if (!"STUDENT".equals(current.getRole()) || !current.getId().equals(userId))
            throw access.forbidden();
    }

    private StudentProfile emptyProfile(Long userId) {
        StudentProfile profile = new StudentProfile();
        profile.setUserId(userId);
        return profile;
    }

    private String required(String value, int limit, String label) {
        String cleaned = clean(value, limit, label);
        if (cleaned == null) throw new IllegalArgumentException(label + " is required");
        return cleaned;
    }

    private String clean(String value, int limit, String label) {
        if (value == null || value.isBlank()) return null;
        String cleaned = value.trim();
        if (cleaned.length() > limit) throw new IllegalArgumentException(label + " is too long");
        return cleaned;
    }

    private String url(String value, String label) {
        String cleaned = clean(value, 500, label);
        if (cleaned == null) return null;
        try {
            URI uri = URI.create(cleaned);
            if (!Set.of("http", "https").contains(String.valueOf(uri.getScheme()).toLowerCase(Locale.ROOT))
                    || uri.getHost() == null) throw new IllegalArgumentException();
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException(label + " URL must be a valid http:// or https:// URL");
        }
        return cleaned;
    }
}
