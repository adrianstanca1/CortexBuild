package com.multimodal.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuration class for Spring Boot application
 * Configures beans, CORS, and other application settings
 */
@Configuration
@Slf4j
public class ApplicationConfig implements WebMvcConfigurer {

    /**
     * RestTemplate bean for making HTTP requests to external services
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    /**
     * CORS configuration for cross-origin requests
     * Allows frontend to communicate with backend
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                        "http://localhost:3000",
                        "http://localhost:5173",
                        "https://asagents.vercel.app",
                        "https://asagents.netlify.app")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .exposedHeaders("X-Total-Count", "X-User-ID", "X-Tenant-ID");
    }
}