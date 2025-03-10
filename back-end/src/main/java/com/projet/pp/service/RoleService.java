package com.projet.pp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.projet.pp.model.Role;
import com.projet.pp.repository.RoleRepository;
import java.util.List;

@Service
public class RoleService {

    @Autowired
    private RoleRepository roleRepository;

    // Récupérer tous les rôles
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    // Récupérer un rôle par son id
    public Role getRoleById(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rôle non trouvé avec l'id: " + id));
    }

    // Créer un nouveau rôle
    public Role createRole(Role role) {
        return roleRepository.save(role);
    }

    // Mettre à jour un rôle existant
    public Role updateRole(Long id, Role roleDetails) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rôle non trouvé avec l'id: " + id));

        role.setLibelle(roleDetails.getLibelle());
        role.setDescription(roleDetails.getDescription());

        return roleRepository.save(role);
    }

    // Supprimer un rôle
    public void deleteRole(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rôle non trouvé avec l'id: " + id));
        roleRepository.delete(role);
    }
}
