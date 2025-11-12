package com.backend.benxere.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class FileStorageService {

    private final Path uploadLocation;
    private final String imageUrlPrefix;

    public FileStorageService(
            @Value("${file-storage.upload-dir:uploads/bus-images}") String uploadDir,
            @Value("${file-storage.image-url-prefix:/api/bus-images}") String imageUrlPrefix) {
        this.uploadLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.imageUrlPrefix = imageUrlPrefix;
        
        try {
            Files.createDirectories(this.uploadLocation);
        } catch (IOException e) {
            log.error("Could not create upload directory: {}", uploadDir, e);
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    public String storeFile(MultipartFile file) {
        String originalFileName = file.getOriginalFilename();
        String fileExtension = "";
        
        if (originalFileName != null && originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        
        // Generate a unique file name to avoid conflicts
        String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
        
        try {
            Path targetLocation = this.uploadLocation.resolve(uniqueFileName);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }
            return imageUrlPrefix + "/" + uniqueFileName;
        } catch (IOException e) {
            log.error("Failed to store file: {}", originalFileName, e);
            throw new RuntimeException("Failed to store file: " + originalFileName, e);
        }
    }

    public Path getFilePath(String fileName) {
        return this.uploadLocation.resolve(fileName);
    }
}