package org.nexasphere.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "recruitment_submissions")
public class RecruitmentSubmissionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;
    
    @Column(unique = true)
    private String collegeEmail;
    
    private String whatsapp;
    @Column(name = "\"year\"")
    private String year;
    private String branch;
    private String section;
    private String role;
    
    @Column(length = 1000)
    private String interests;
    
    @Column(length = 1000)
    private String skills;
    
    @Column(length = 2000)
    private String whyJoin;
    
    private String status; // "applied" | "shortlisted" | "rejected" | "selected"
    private LocalDateTime submittedAt;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getCollegeEmail() { return collegeEmail; }
    public void setCollegeEmail(String collegeEmail) { this.collegeEmail = collegeEmail; }
    public String getWhatsapp() { return whatsapp; }
    public void setWhatsapp(String whatsapp) { this.whatsapp = whatsapp; }
    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }
    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getInterests() { return interests; }
    public void setInterests(String interests) { this.interests = interests; }
    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }
    public String getWhyJoin() { return whyJoin; }
    public void setWhyJoin(String whyJoin) { this.whyJoin = whyJoin; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
}
