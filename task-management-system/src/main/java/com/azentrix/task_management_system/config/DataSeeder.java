package com.azentrix.task_management_system.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.azentrix.task_management_system.entity.Role;
import com.azentrix.task_management_system.enums.RoleEnum;
import com.azentrix.task_management_system.repository.RoleRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) throws Exception {
        if (roleRepository.count() == 0) {
            log.info("No roles found in database. Seeding default roles...");

            Role userRole = new Role();
            userRole.setName(RoleEnum.USER);
            
            Role adminRole = new Role();
            adminRole.setName(RoleEnum.ADMIN);
            
            roleRepository.save(userRole);
            roleRepository.save(adminRole);

            log.info("Default roles seeded successfully.");
        }
    }
}
