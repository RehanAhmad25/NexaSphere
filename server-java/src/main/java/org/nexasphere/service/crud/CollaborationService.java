package org.nexasphere.service.crud;

import org.nexasphere.model.entity.CollaborationTeamEntity;
import org.nexasphere.model.entity.JoinRequestEntity;
import org.nexasphere.repository.CollaborationTeamRepository;
import org.nexasphere.repository.JoinRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class CollaborationService {

    @Autowired
    private CollaborationTeamRepository teamRepository;

    @Autowired
    private JoinRequestRepository requestRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${INTERNAL_SERVICE_URL:http://localhost:8000}")
    private String internalServiceUrl;

    @Value("${INTERNAL_SERVICE_SECRET:}")
    private String internalServiceSecret;

    public List<CollaborationTeamEntity> getAllTeams() {
        return teamRepository.findAll();
    }

    public CollaborationTeamEntity createTeam(CollaborationTeamEntity team) {
        CollaborationTeamEntity saved = teamRepository.save(team);
        return Objects.requireNonNull(saved, "saved team must not be null");
    }

    public JoinRequestEntity submitJoinRequest(JoinRequestEntity request) {
        JoinRequestEntity saved = Objects.requireNonNull(
                requestRepository.save(request), "saved join request must not be null");

        // Notify via Python microservice
        try {
            String url = internalServiceUrl + "/notify/join-request";
            HttpHeaders headers = new HttpHeaders();
            if (internalServiceSecret != null && !internalServiceSecret.isEmpty()) {
                headers.set("X-Service-Auth", internalServiceSecret);
            }
            HttpEntity<JoinRequestEntity> request = new HttpEntity<>(saved, headers);
            restTemplate.postForObject(url, request, String.class);
        } catch (Exception e) {
            // Log error, continue execution
            System.err.println("Failed to notify python microservice: " + e.getMessage());
        }

        return saved;
    }

    public Optional<JoinRequestEntity> updateRequestStatus(Long requestId, String status) {
        long safeId = Objects.requireNonNull(requestId, "requestId must not be null");
        Optional<JoinRequestEntity> optionalReq = requestRepository.findById(safeId);
        if (optionalReq.isPresent()) {
            JoinRequestEntity req = optionalReq.get();
            req.setStatus(status);
            return Optional.of(Objects.requireNonNull(requestRepository.save(req)));
        }
        return Optional.empty();
    }
}
