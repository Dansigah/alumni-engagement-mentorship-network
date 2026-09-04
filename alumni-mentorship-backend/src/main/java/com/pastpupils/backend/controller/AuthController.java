package com.pastpupils.backend.controller;

import com.pastpupils.backend.dto.ForgotPasswordRequest;
import com.pastpupils.backend.dto.ForgotPasswordResponse;
import com.pastpupils.backend.dto.ResetPasswordRequest;
import com.pastpupils.backend.service.PasswordResetService;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final PasswordResetService passwordResets;

    public AuthController(PasswordResetService passwordResets) {
        this.passwordResets = passwordResets;
    }

    @PostMapping("/forgot-password")
    public ForgotPasswordResponse forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return passwordResets.request(request.getEmail());
    }

    @PostMapping("/reset-password")
    public Map<String, String> resetPassword(@RequestBody ResetPasswordRequest request) {
        passwordResets.reset(request.getToken(), request.getNewPassword());
        return Map.of("message", "Password reset successfully. You can now sign in.");
    }
}
