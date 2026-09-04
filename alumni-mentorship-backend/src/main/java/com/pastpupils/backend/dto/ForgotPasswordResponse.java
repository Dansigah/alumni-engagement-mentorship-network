package com.pastpupils.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

public class ForgotPasswordResponse {
    private final String message;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private final String resetToken;

    public ForgotPasswordResponse(String message, String resetToken) {
        this.message = message;
        this.resetToken = resetToken;
    }
    public String getMessage() { return message; }
    public String getResetToken() { return resetToken; }
}
