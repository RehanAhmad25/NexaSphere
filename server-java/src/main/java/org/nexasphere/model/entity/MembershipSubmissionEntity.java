package org.nexasphere.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "membership_submissions")
public class MembershipSubmissionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;
    
    @Column(unique = true)
    private String collegeEmail;
    
    private String rollNumber;
    private String course;
    private String branch;
    private String section;
    private String semester;
    private String whatsapp;
    
    @Column(length = 1000)
    private String groupsSelected;
    
    @Column(length = 2000)
    private String whyJoin;
    
    private String status; // "applied" | "onboarded" | "rejected"
    private LocalDateTime submittedAt;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getCollegeEmail() { return collegeEmail; }
    public void setCollegeEmail(String collegeEmail) { this.collegeEmail = collegeEmail; }
    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }
    public String getCourse() { return course; }
    public void setCourse(String course) { this.course = course; }
    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }
    public String getWhatsapp() { return whatsapp; }
    public void setWhatsapp(String whatsapp) { this.whatsapp = whatsapp; }
    public String getGroupsSelected() { return groupsSelected; }
    public void setGroupsSelected(String groupsSelected) { this.groupsSelected = groupsSelected; }
    public String getWhyJoin() { return whyJoin; }
    public void setWhyJoin(String whyJoin) { this.whyJoin = whyJoin; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
}
