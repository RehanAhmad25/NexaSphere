package org.nexasphere.controller;

import org.nexasphere.model.entity.MembershipSubmissionEntity;
import org.nexasphere.model.entity.RecruitmentSubmissionEntity;
import org.nexasphere.repository.MembershipSubmissionRepository;
import org.nexasphere.repository.RecruitmentSubmissionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/submissions")
public class AdminSubmissionsController {

    private final MembershipSubmissionRepository membershipRepo;
    private final RecruitmentSubmissionRepository recruitmentRepo;

    public AdminSubmissionsController(MembershipSubmissionRepository membershipRepo, 
                                      RecruitmentSubmissionRepository recruitmentRepo) {
        this.membershipRepo = membershipRepo;
        this.recruitmentRepo = recruitmentRepo;
    }

    @GetMapping("/membership")
    public Map<String, Object> getMembershipSubmissions() {
        return Map.of("submissions", membershipRepo.findAll());
    }

    @GetMapping("/recruitment")
    public Map<String, Object> getRecruitmentSubmissions() {
        return Map.of("submissions", recruitmentRepo.findAll());
    }

    @PatchMapping("/membership/{id}/status")
    public ResponseEntity<MembershipSubmissionEntity> updateMembershipStatus(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        return membershipRepo.findById(id).map(s -> {
            s.setStatus(body.get("status"));
            return ResponseEntity.ok(membershipRepo.save(s));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/recruitment/{id}/status")
    public ResponseEntity<RecruitmentSubmissionEntity> updateRecruitmentStatus(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        return recruitmentRepo.findById(id).map(s -> {
            s.setStatus(body.get("status"));
            return ResponseEntity.ok(recruitmentRepo.save(s));
        }).orElse(ResponseEntity.notFound().build());
    }
}
