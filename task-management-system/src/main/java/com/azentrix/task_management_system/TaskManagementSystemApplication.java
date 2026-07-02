package com.azentrix.task_management_system;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import org.springframework.scheduling.annotation.EnableScheduling;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;
import lombok.extern.slf4j.Slf4j;

@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling
@Slf4j
public class TaskManagementSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(TaskManagementSystemApplication.class, args);
	}

	@Bean
	CommandLineRunner updateSchema(JdbcTemplate jdbcTemplate) {
		return args -> {
			try {
				jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN avatar LONGTEXT;");
				log.info("Successfully ensured avatar column is LONGTEXT.");
			} catch (Exception e) {
				log.warn("Could not alter avatar column: {}", e.getMessage());
			}
		};
	}
}
