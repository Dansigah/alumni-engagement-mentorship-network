package com.pastpupils.backend.dto;

import com.pastpupils.backend.entity.User;
import com.pastpupils.backend.entity.AccountStatus;
import com.pastpupils.backend.entity.VerificationStatus;
import java.util.List;

public class UserResponse {
    public Long id;
    public String name;
    public String email;
    public String role;
    public VerificationStatus verificationStatus;
    public AccountStatus accountStatus;
    public String professionalTitle;
    public String currentCompany;
    public String currentPosition;
    public String industry;
    public Integer yearsOfExperience;
    public String location;
    public Boolean mentoringAvailable;
    public List<String> skills = List.of();

    public UserResponse(User u) {
        id = u.getId();
        name = u.getName();
        email = u.getEmail();
        role = u.getRole();
        verificationStatus = u.getVerificationStatus();
        accountStatus = u.getAccountStatus();
    }
}
