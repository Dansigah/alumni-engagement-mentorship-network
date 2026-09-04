package com.pastpupils.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "mentorship_sessions")
public class MentorshipSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long studentId;
    private Long alumniId;
    private String title;
    @Column(length = 2000)
    private String description;
    private LocalDateTime sessionDate;
    private String topic;
    private LocalTime sessionTime;
    private String mode;
    private String meetingLink;
    private String venue;
    @Column(length = 2000)
    private String notes;
    private String status = "SCHEDULED";

    public Long getId() {
        return id;
    }

    public void setId(Long v) {
        id = v;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long v) {
        studentId = v;
    }

    public Long getAlumniId() {
        return alumniId;
    }

    public void setAlumniId(Long v) {
        alumniId = v;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String v) {
        title = v;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String v) {
        description = v;
    }

    public LocalDateTime getSessionDate() {
        return sessionDate;
    }

    public void setSessionDate(LocalDateTime v) {
        sessionDate = v;
    }

    public String getTopic() { return topic; }
    public void setTopic(String value) { topic = value; }
    public LocalTime getSessionTime() { return sessionTime; }
    public void setSessionTime(LocalTime value) { sessionTime = value; }
    public String getMode() { return mode; }
    public void setMode(String value) { mode = value; }
    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String value) { meetingLink = value; }
    public String getVenue() { return venue; }
    public void setVenue(String value) { venue = value; }
    public String getNotes() { return notes; }
    public void setNotes(String value) { notes = value; }

    public String getStatus() {
        return status;
    }

    public void setStatus(String v) {
        status = v;
    }
}
