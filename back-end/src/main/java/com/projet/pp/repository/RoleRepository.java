package com.projet.pp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.projet.pp.model.Role;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

}
