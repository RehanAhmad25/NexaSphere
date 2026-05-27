package org.nexasphere.repository;

import org.nexasphere.model.entity.MembershipSubmissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MembershipSubmissionRepository extends JpaRepository<MembershipSubmissionEntity, Long> {
    boolean existsByCollegeEmail(String collegeEmail);
    Optional<MembershipSubmissionEntity> findByCollegeEmail(String collegeEmail);
}
