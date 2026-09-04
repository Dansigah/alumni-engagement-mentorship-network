package com.pastpupils.backend.repository;

import com.pastpupils.backend.entity.ReferralRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

public interface ReferralRequestRepository extends JpaRepository<ReferralRequest, Long> {
    List<ReferralRequest> findByStudentId(Long studentId);

    List<ReferralRequest> findByAlumniId(Long alumniId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select request from ReferralRequest request where request.id = :id")
    Optional<ReferralRequest> findByIdForStatusUpdate(@Param("id") Long id);
}
