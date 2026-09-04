package com.pastpupils.backend.repository;

import com.pastpupils.backend.entity.EmploymentHistory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmploymentHistoryRepository extends JpaRepository<EmploymentHistory, Long> {
    List<EmploymentHistory> findByAlumniIdOrderByStartDateDesc(Long alumniId);
}
