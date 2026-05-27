package org.nexasphere.controller;

import org.nexasphere.model.entity.ActivityEventEntity;
import org.nexasphere.model.entity.CoreTeamMemberEntity;
import org.nexasphere.model.entity.EventEntity;
import org.nexasphere.repository.ActivityEventRepository;
import org.nexasphere.repository.CoreTeamRepository;
import org.nexasphere.repository.EventRepository;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for public-facing content used by the main NexaSphere website.
 * These endpoints do not require authentication.
 */
@RestController
@RequestMapping("/api/content")
public class PublicContentController {

    private final EventRepository eventRepo;
    private final CoreTeamRepository coreTeamRepo;
    private final ActivityEventRepository activityEventRepo;

    public PublicContentController(EventRepository eventRepo, 
                                   CoreTeamRepository coreTeamRepo, 
                                   ActivityEventRepository activityEventRepo) {
        this.eventRepo = eventRepo;
        this.coreTeamRepo = coreTeamRepo;
        this.activityEventRepo = activityEventRepo;
    }

    @GetMapping("/events")
    public Map<String, Object> getEvents() {
        return Map.of("events", eventRepo.findAll());
    }

    @GetMapping("/team")
    public Map<String, Object> getTeam() {
        return Map.of("members", coreTeamRepo.findAll());
    }

    @GetMapping("/activity-events/{activityKey}")
    public Map<String, Object> getActivityEvents(@PathVariable String activityKey) {
        return Map.of("events", activityEventRepo.findByActivityKey(activityKey));
    }
}
