package com.backend.benxere;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BenXeSoApplication {
    public static void main(String[] args) {
        // Force UTF-8 encoding for the entire application
        System.setProperty("file.encoding", "UTF-8");
        System.setProperty("sun.jnu.encoding", "UTF-8");
        System.setProperty("spring.http.encoding.charset", "UTF-8");
        System.setProperty("spring.http.encoding.enabled", "true");
        System.setProperty("spring.http.encoding.force", "true");
        
        SpringApplication.run(BenXeSoApplication.class, args);
    }
}