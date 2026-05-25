package org.nexasphere.controller;

import jakarta.validation.Valid;
import org.nexasphere.model.entity.CoreTeamMemberEntity;
import org.nexasphere.repository.CoreTeamRepository;
import org.nexasphere.util.Sanitizer;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/admin/core-team")
@Tag(name = "Core Team Management", description = "Endpoints for managing the core team members")
public class CoreTeamController {

    private final CoreTeamRepository repo;
    private final Sanitizer sanitizer;

    public CoreTeamController(CoreTeamRepository repo, Sanitizer sanitizer) {
        this.repo = repo;
        this.sanitizer = sanitizer;
    }

    @GetMapping
    public Map<String, Object> getAll() {
        List<CoreTeamMemberEntity> members = repo.findAll();
        return Map.of("members", members);
    }

    @PostMapping
    public ResponseEntity<CoreTeamMemberEntity> add(@Valid @RequestBody CoreTeamMemberEntity member) {
        member.setId(null);
        member.setName(sanitizer.clean(member.getName()));
        return ResponseEntity.status(HttpStatus.CREATED).body(repo.save(member));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
