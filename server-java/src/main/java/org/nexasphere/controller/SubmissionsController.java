package org.nexasphere.controller;

import jakarta.validation.Valid;
import org.nexasphere.model.entity.MembershipSubmissionEntity;
import org.nexasphere.model.entity.RecruitmentSubmissionEntity;
import org.nexasphere.repository.MembershipSubmissionRepository;
import org.nexasphere.repository.RecruitmentSubmissionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionsController {

    private final MembershipSubmissionRepository membershipRepo;
    private final RecruitmentSubmissionRepository recruitmentRepo;

    public SubmissionsController(MembershipSubmissionRepository membershipRepo, 
                                 RecruitmentSubmissionRepository recruitmentRepo) {
        this.membershipRepo = membershipRepo;
        this.recruitmentRepo = recruitmentRepo;
    }

    @PostMapping("/membership")
    public ResponseEntity<Object> submitMembership(@Valid @RequestBody MembershipSubmissionEntity submission) {
        if (membershipRepo.existsByCollegeEmail(submission.getCollegeEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "A submission with this email already exists."));
        }
        submission.setId(null);
        submission.setStatus("applied");
        submission.setSubmittedAt(LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.CREATED).body(membershipRepo.save(submission));
    }

    @PostMapping("/recruitment")
    public ResponseEntity<Object> submitRecruitment(@Valid @RequestBody RecruitmentSubmissionEntity submission) {
        if (recruitmentRepo.existsByCollegeEmail(submission.getCollegeEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "A submission with this email already exists."));
        }
        submission.setId(null);
        submission.setStatus("applied");
        submission.setSubmittedAt(LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.CREATED).body(recruitmentRepo.save(submission));
    }
}
