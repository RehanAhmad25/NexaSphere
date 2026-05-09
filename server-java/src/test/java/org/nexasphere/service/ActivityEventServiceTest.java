package org.nexasphere.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.nexasphere.model.entity.ActivityEvent;
import org.nexasphere.model.events.ActivityEventCreatedEvent;
import org.nexasphere.repository.ActivityEventRepository;
import org.nexasphere.service.crud.ActivityEventService;
import org.nexasphere.util.Sanitizer;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ActivityEventServiceTest {

    @Mock
    private ActivityEventRepository repository;
    
    @Mock
    private AdminEventPublisher eventPublisher;
    
    @Mock
    private Sanitizer sanitizer;

    @InjectMocks
    private ActivityEventService service;

    private ActivityEvent testEvent;

    @BeforeEach
    void setUp() {
        testEvent = new ActivityEvent();
        testEvent.setId("manual-123");
        testEvent.setActivityKey("insight-session");
        testEvent.setName("Test Event");
        testEvent.setTagline("Test Tagline");
        testEvent.setDescription("Test Description");
        testEvent.setStatus("upcoming");
    }

    @Test
    void createEvent_ValidActivity_Succeeds() {
        when(sanitizer.sanitizeHtml(anyString())).thenAnswer(i -> i.getArgument(0));
        when(repository.save(any(ActivityEvent.class))).thenReturn(testEvent);

        ActivityEvent result = service.createEvent("insight-session", testEvent, "admin@test.com");

        assertNotNull(result);
        verify(repository).save(testEvent);
        verify(eventPublisher).publish(any(ActivityEventCreatedEvent.class));
    }

    @Test
    void createEvent_InvalidActivity_ThrowsException() {
        assertThrows(ResponseStatusException.class, () -> 
            service.createEvent("invalid-key", testEvent, "admin@test.com"));
    }

    @Test
    void deleteEvent_Exists_Succeeds() {
        when(repository.findByIdAndActivityKey("manual-123", "insight-session"))
            .thenReturn(Optional.of(testEvent));

        service.deleteEvent("insight-session", "manual-123", "admin@test.com");

        verify(repository).delete(testEvent);
        verify(eventPublisher).publish(any());
    }

    @Test
    void deleteEvent_NotFound_ThrowsException() {
        when(repository.findByIdAndActivityKey(anyString(), anyString()))
            .thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> 
            service.deleteEvent("insight-session", "non-existent", "admin@test.com"));
    }
}
