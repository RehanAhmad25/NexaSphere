package org.nexasphere.repository;

import org.nexasphere.model.entity.RecruitmentSubmissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RecruitmentSubmissionRepository extends JpaRepository<RecruitmentSubmissionEntity, Long> {
    boolean existsByCollegeEmail(String collegeEmail);
    Optional<RecruitmentSubmissionEntity> findByCollegeEmail(String collegeEmail);
}
