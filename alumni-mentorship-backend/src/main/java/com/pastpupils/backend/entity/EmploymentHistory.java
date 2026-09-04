package com.pastpupils.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "employment_history")
public class EmploymentHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "alumni_id", nullable = false)
    private Long alumniId;
    @Column(nullable = false)
    private String companyName;
    @Column(nullable = false)
    private String jobTitle;
    @Column(nullable = false)
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean currentlyWorking;
    @Column(length = 2000)
    private String description;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAlumniId() { return alumniId; }
    public void setAlumniId(Long alumniId) { this.alumniId = alumniId; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String value) { companyName = value; }
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String value) { jobTitle = value; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate value) { startDate = value; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate value) { endDate = value; }
    public boolean isCurrentlyWorking() { return currentlyWorking; }
    public void setCurrentlyWorking(boolean value) { currentlyWorking = value; }
    public String getDescription() { return description; }
    public void setDescription(String value) { description = value; }
}
