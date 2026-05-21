package org.nexasphere.repository;

import org.nexasphere.model.entity.UserProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfileEntity, String> {
    Optional<UserProfileEntity> findByUserId(String userId);
    List<UserProfileEntity> findTop10ByOrderByXpDesc();
}
