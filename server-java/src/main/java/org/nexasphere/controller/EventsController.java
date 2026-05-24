package org.nexasphere.controller;

import jakarta.validation.Valid;
import org.nexasphere.model.entity.EventEntity;
import org.nexasphere.repository.EventRepository;
import org.nexasphere.util.Sanitizer;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/admin/events")
@Tag(name = "Events Management", description = "Endpoints for managing NexaSphere events")
@SuppressWarnings("null")
public class EventsController {

    private final EventRepository repo;
    private final Sanitizer sanitizer;

    public EventsController(EventRepository repo, Sanitizer sanitizer) {
        this.repo = repo;
        this.sanitizer = sanitizer;
    }

    @GetMapping
    public Map<String, Object> getAll() {
        List<EventEntity> events = repo.findAll();
        return Map.of("events", events);
    }

    @PostMapping
    public ResponseEntity<EventEntity> create(@Valid @RequestBody EventEntity event) {
        event.setId(null);
        event.setName(sanitizer.clean(event.getName()));
        return ResponseEntity.status(HttpStatus.CREATED).body(repo.save(event));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventEntity> update(@PathVariable String id, @Valid @RequestBody EventEntity event) {
        return repo.findById(id).map(existing -> {
            event.setId(id);
            event.setName(sanitizer.clean(event.getName()));
            return ResponseEntity.ok(repo.save(event));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
