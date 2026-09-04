package com.pastpupils.backend.repository;

import com.pastpupils.backend.entity.PasswordResetToken;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    List<PasswordResetToken> findByUserIdAndUsedFalse(Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<PasswordResetToken> findByTokenHash(String tokenHash);
}
