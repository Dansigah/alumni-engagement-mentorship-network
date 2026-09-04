package com.pastpupils.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "alumni_skills",
        uniqueConstraints = @UniqueConstraint(columnNames = { "alumni_id", "name" }))
public class AlumniSkill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "alumni_id", nullable = false)
    private Long alumniId;
    @Column(nullable = false, length = 100)
    private String name;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAlumniId() { return alumniId; }
    public void setAlumniId(Long alumniId) { this.alumniId = alumniId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
