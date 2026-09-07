package com.pastpupils.backend.entity;

import jakarta.persistence.*;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "student_profiles", uniqueConstraints = @UniqueConstraint(columnNames = "user_id"))
public class StudentProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "user_id", nullable = false)
    private Long userId;
    private String courseProgram;
    private String department;
    private Integer joiningYear;
    @Column(name = "expected_completion_year")
    private Integer expectedCompletionYear;
    @Column(length = 2000)
    private String careerInterests;
    @Column(length = 3000)
    private String bio;
    @Column(length = 500)
    private String linkedinUrl;
    @Column(length = 500)
    private String githubUrl;
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "student_profile_skills", joinColumns = @JoinColumn(name = "student_profile_id"),
            uniqueConstraints = @UniqueConstraint(columnNames = {"student_profile_id", "name"}))
    @Column(name = "name", nullable = false, length = 100)
    private Set<String> skills = new LinkedHashSet<>();

    public Long getId() { return id; }
    public void setId(Long value) { id = value; }
    public Long getUserId() { return userId; }
    public void setUserId(Long value) { userId = value; }
    public String getCourseProgram() { return courseProgram; }
    public void setCourseProgram(String value) { courseProgram = value; }
    public String getDepartment() { return department; }
    public void setDepartment(String value) { department = value; }
    public Integer getJoiningYear() { return joiningYear; }
    public void setJoiningYear(Integer value) { joiningYear = value; }
    public Integer getExpectedCompletionYear() { return expectedCompletionYear; }
    public void setExpectedCompletionYear(Integer value) { expectedCompletionYear = value; }
    public String getCareerInterests() { return careerInterests; }
    public void setCareerInterests(String value) { careerInterests = value; }
    public String getBio() { return bio; }
    public void setBio(String value) { bio = value; }
    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String value) { linkedinUrl = value; }
    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String value) { githubUrl = value; }
    public Set<String> getSkills() { return skills; }
    public void setSkills(Set<String> value) { skills = value; }
}
