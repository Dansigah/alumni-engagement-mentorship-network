package com.pastpupils.backend.controller;

import com.pastpupils.backend.entity.StudentProfile;
import com.pastpupils.backend.service.StudentProfileService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student-profiles")
public class StudentProfileController {
    private final StudentProfileService service;

    public StudentProfileController(StudentProfileService service) {
        this.service = service;
    }

    @GetMapping("/{userId}")
    public StudentProfile profile(@PathVariable Long userId) {
        return service.profile(userId);
    }

    @PutMapping("/{userId}")
    public StudentProfile saveProfile(@PathVariable Long userId, @RequestBody StudentProfile profile) {
        return service.saveProfile(userId, profile);
    }
}
