package com.pastpupils.backend.repository;

import com.pastpupils.backend.entity.AlumniProfile;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlumniProfileRepository extends JpaRepository<AlumniProfile, Long> {
    Optional<AlumniProfile> findByUserId(Long userId);
}
