package com.pastpupils.backend.repository;

import com.pastpupils.backend.entity.MentorshipSession;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.Optional;

public interface MentorshipSessionRepository extends JpaRepository<MentorshipSession, Long> {
    List<MentorshipSession> findByStudentIdOrAlumniId(Long studentId, Long alumniId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select session from MentorshipSession session where session.id = :id")
    Optional<MentorshipSession> findByIdForStatusUpdate(@Param("id") Long id);
}
