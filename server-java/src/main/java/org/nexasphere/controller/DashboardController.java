package org.nexasphere.controller;

import org.nexasphere.model.entity.QuestEntity;
import org.nexasphere.model.entity.UserProfileEntity;
import org.nexasphere.repository.QuestRepository;
import org.nexasphere.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private QuestRepository questRepository;

    @GetMapping("/profile/{userId}")
    public ResponseEntity<UserProfileEntity> getProfile(@PathVariable String userId) {
        Optional<UserProfileEntity> profile = userProfileRepository.findByUserId(userId);
        if (profile.isPresent()) {
            return ResponseEntity.ok(profile.get());
        } else {
            // Create a default profile if not exists
            UserProfileEntity newProfile = new UserProfileEntity();
            newProfile.setUserId(userId);
            newProfile.setUsername("User " + userId.substring(0, Math.min(4, userId.length())));
            return ResponseEntity.ok(userProfileRepository.save(newProfile));
        }
    }

    @PostMapping("/profile/{userId}/interests")
    public ResponseEntity<UserProfileEntity> updateInterests(@PathVariable String userId, @RequestBody List<String> interests) {
        Optional<UserProfileEntity> profileOpt = userProfileRepository.findByUserId(userId);
        if (profileOpt.isPresent()) {
            UserProfileEntity profile = profileOpt.get();
            profile.setInterests(interests);
            return ResponseEntity.ok(userProfileRepository.save(profile));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<UserProfileEntity>> getLeaderboard() {
        return ResponseEntity.ok(userProfileRepository.findTop10ByOrderByXpDesc());
    }

    @GetMapping("/quests/{userId}")
    public ResponseEntity<List<QuestEntity>> getQuests(@PathVariable String userId) {
        List<QuestEntity> quests = questRepository.findByUserId(userId);
        if (quests.isEmpty()) {
            // Seed some initial quests for the user if none exist
            QuestEntity q1 = new QuestEntity();
            q1.setUserId(userId);
            q1.setTitle("View Roadmap");
            q1.setDescription("Check out our learning roadmaps.");
            q1.setXpReward(50);
            
            QuestEntity q2 = new QuestEntity();
            q2.setUserId(userId);
            q2.setTitle("Join Hackathon");
            q2.setDescription("Participate in an upcoming hackathon event.");
            q2.setXpReward(200);

            questRepository.saveAll(List.of(q1, q2));
            quests = questRepository.findByUserId(userId);
        }
        return ResponseEntity.ok(quests);
    }

    @PostMapping("/quests/{questId}/complete")
    public ResponseEntity<Map<String, Object>> completeQuest(@PathVariable String questId) {
        Optional<QuestEntity> questOpt = questRepository.findById(questId);
        if (questOpt.isPresent()) {
            QuestEntity quest = questOpt.get();
            if (!quest.isCompleted()) {
                quest.setCompleted(true);
                questRepository.save(quest);

                // Add XP to user profile
                Optional<UserProfileEntity> profileOpt = userProfileRepository.findByUserId(quest.getUserId());
                if (profileOpt.isPresent()) {
                    UserProfileEntity profile = profileOpt.get();
                    profile.setXp(profile.getXp() + quest.getXpReward());
                    
                    // Simple level up logic
                    if (profile.getXp() >= profile.getLevel() * 1000) {
                        profile.setLevel(profile.getLevel() + 1);
                        // Grant a badge potentially
                        if (profile.getLevel() == 5 && !profile.getBadges().contains("Dedicated Learner")) {
                            profile.getBadges().add("Dedicated Learner");
                        }
                    }
                    userProfileRepository.save(profile);
                }
            }
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("quest", quest);
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.notFound().build();
    }
}
