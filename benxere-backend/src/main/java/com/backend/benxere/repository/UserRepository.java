package com.backend.benxere.repository;

import com.backend.benxere.entity.User;
import com.backend.benxere.entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findAllByRole(Role role);
    List<User> findAllByEmployer(User employer);
    
    List<User> findAllByEmployerAndRole(User employer, Role role);
    
    List<User> findAllByRoleOrderByCreatedAtDesc(Role role);
    
    boolean existsByEmailAndRole(String email, Role role);
}
