package com.multimodal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Main Application class for ASAgents Multimodal Backend
 * Enterprise-grade construction management platform with multimodal AI
 * integration
 */
@SpringBootApplication(exclude = { SecurityAutoConfiguration.class })
@EnableJpaRepositories
@EnableTransactionManagement
public class MultimodalBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(MultimodalBackendApplication.class, args);
        System.out.println("🚀 ASAgents Multimodal Backend started successfully!");
        System.out.println("🔧 Java " + System.getProperty("java.version"));
        System.out.println("🌐 Server running on http://localhost:8080");
        System.out.println("📚 API Documentation: http://localhost:8080/swagger-ui.html");
        System.out.println("🏗️  Construction Management Platform Ready!");
    }
}