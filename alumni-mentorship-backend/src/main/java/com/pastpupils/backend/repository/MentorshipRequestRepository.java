package com.pastpupils.backend.repository;

import com.pastpupils.backend.entity.MentorshipRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

public interface MentorshipRequestRepository extends JpaRepository<MentorshipRequest, Long> {
    List<MentorshipRequest> findByStudentId(Long studentId);

    List<MentorshipRequest> findByAlumniId(Long alumniId);

    boolean existsByStudentIdAndAlumniIdAndStatus(Long studentId, Long alumniId, String status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select request from MentorshipRequest request where request.id = :id")
    Optional<MentorshipRequest> findByIdForStatusUpdate(@Param("id") Long id);
}
