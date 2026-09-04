package com.pastpupils.backend.controller;

import java.util.Map;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<?> status(ResponseStatusException e) {
        return ResponseEntity.status(e.getStatusCode())
                .body(Map.of("message", e.getReason() == null ? "Request failed" : e.getReason()));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> runtime(RuntimeException e) {
        return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage() == null ? "Request failed" : e.getMessage()));
    }
}
