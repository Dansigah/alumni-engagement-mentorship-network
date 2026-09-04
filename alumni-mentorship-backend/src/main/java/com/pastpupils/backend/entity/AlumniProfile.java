package com.pastpupils.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "alumni_profiles", uniqueConstraints = @UniqueConstraint(columnNames = "user_id"))
public class AlumniProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "user_id", nullable = false)
    private Long userId;
    private String professionalTitle;
    private String currentCompany;
    private String currentPosition;
    private String industry;
    private Integer yearsOfExperience;
    private String location;
    @Column(length = 3000)
    private String professionalSummary;
    private String linkedinUrl;
    private boolean mentoringAvailable;
    @Column(length = 500)
    private String availabilityNote;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getProfessionalTitle() { return professionalTitle; }
    public void setProfessionalTitle(String value) { professionalTitle = value; }
    public String getCurrentCompany() { return currentCompany; }
    public void setCurrentCompany(String value) { currentCompany = value; }
    public String getCurrentPosition() { return currentPosition; }
    public void setCurrentPosition(String value) { currentPosition = value; }
    public String getIndustry() { return industry; }
    public void setIndustry(String value) { industry = value; }
    public Integer getYearsOfExperience() { return yearsOfExperience; }
    public void setYearsOfExperience(Integer value) { yearsOfExperience = value; }
    public String getLocation() { return location; }
    public void setLocation(String value) { location = value; }
    public String getProfessionalSummary() { return professionalSummary; }
    public void setProfessionalSummary(String value) { professionalSummary = value; }
    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String value) { linkedinUrl = value; }
    public boolean isMentoringAvailable() { return mentoringAvailable; }
    public void setMentoringAvailable(boolean value) { mentoringAvailable = value; }
    public String getAvailabilityNote() { return availabilityNote; }
    public void setAvailabilityNote(String value) { availabilityNote = value; }
}
