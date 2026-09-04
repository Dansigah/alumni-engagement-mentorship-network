package com.pastpupils.backend.controller;

import com.pastpupils.backend.entity.Event;
import com.pastpupils.backend.repository.EventRepository;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventRepository repo;

    public EventController(EventRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Event> all() {
        return repo.findAll();
    }

    @PostMapping
    public Event create(@RequestBody Event e) {

        // Ignore the ID sent by Swagger/client.
        // MySQL must generate the ID for a new event.
        e.setId(null);

        return repo.save(e);
    }

    @PutMapping("/{id}")
    public Event update(@PathVariable Long id, @RequestBody Event e) {

        Event x = repo.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Event not found"
                        )
                );

        x.setTitle(e.getTitle());
        x.setDescription(e.getDescription());
        x.setEventDate(e.getEventDate());
        x.setLocation(e.getLocation());
        x.setCreatedBy(e.getCreatedBy());

        return repo.save(x);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> delete(@PathVariable Long id) {

        if (!repo.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Event not found"
            );
        }

        repo.deleteById(id);

        return Map.of(
                "message",
                "Event deleted successfully"
        );
    }
}