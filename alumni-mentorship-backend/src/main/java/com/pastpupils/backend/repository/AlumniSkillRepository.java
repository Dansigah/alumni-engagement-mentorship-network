package com.pastpupils.backend.repository;

import com.pastpupils.backend.entity.AlumniSkill;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlumniSkillRepository extends JpaRepository<AlumniSkill, Long> {
    List<AlumniSkill> findByAlumniIdOrderByNameAsc(Long alumniId);
    boolean existsByAlumniIdAndNameIgnoreCase(Long alumniId, String name);
}
