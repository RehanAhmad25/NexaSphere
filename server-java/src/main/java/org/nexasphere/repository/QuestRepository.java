package org.nexasphere.repository;

import org.nexasphere.model.entity.QuestEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestRepository extends JpaRepository<QuestEntity, String> {
    List<QuestEntity> findByUserId(String userId);
}
