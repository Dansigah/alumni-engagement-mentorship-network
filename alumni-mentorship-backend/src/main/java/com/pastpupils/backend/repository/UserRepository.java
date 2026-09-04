package com.pastpupils.backend.repository;

import com.pastpupils.backend.entity.User;
import com.pastpupils.backend.entity.AccountStatus;
import com.pastpupils.backend.entity.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    List<User> findByRoleIgnoreCase(String role);

    List<User> findByRoleIgnoreCaseAndVerificationStatus(String role, VerificationStatus verificationStatus);

    List<User> findByRoleIgnoreCaseAndVerificationStatusAndAccountStatus(
            String role, VerificationStatus verificationStatus, AccountStatus accountStatus);
}
