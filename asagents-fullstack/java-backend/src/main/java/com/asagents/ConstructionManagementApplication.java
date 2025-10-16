package com.asagents;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * ASAgents Construction Management Application
 * 
 * A comprehensive construction management platform built with Spring Boot
 * that provides project management, client management, team coordination,
 * financial tracking, and safety management capabilities.
 * 
 * @author Adrian Stanca
 * @version 1.0.0
 * @since 2024-01-01
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableCaching
@EnableAsync
@EnableScheduling
@EnableTransactionManagement
public class ConstructionManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(ConstructionManagementApplication.class, args);
    }
}
