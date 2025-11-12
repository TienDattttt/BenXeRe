package com.backend.benxere.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class LocationCodeService {
    
    private final Map<String, String> nameToCodeMap = new HashMap<>();
    private final Map<String, String> codeToNameMap = new HashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @PostConstruct
    public void loadLocationData() {
        try {
            ClassPathResource resource = new ClassPathResource("tinh_tp.json");
            JsonNode rootNode = objectMapper.readTree(resource.getInputStream());
            
            rootNode.fields().forEachRemaining(entry -> {
                String code = entry.getKey();
                JsonNode locationNode = entry.getValue();
                
                String name = locationNode.get("name").asText();
                String slug = locationNode.get("slug").asText();
                String nameWithType = locationNode.get("name_with_type").asText();
                
                // Map various forms of the location name to code
                nameToCodeMap.put(name.toLowerCase(), code);
                nameToCodeMap.put(slug.toLowerCase(), code);
                nameToCodeMap.put(nameWithType.toLowerCase(), code);
                
                // Also map without accents for better matching
                nameToCodeMap.put(removeAccents(name).toLowerCase(), code);
                nameToCodeMap.put(removeAccents(nameWithType).toLowerCase(), code);
                
                // Reverse mapping
                codeToNameMap.put(code, name);
            });
            
            log.info("Loaded {} location mappings from tinh_tp.json", nameToCodeMap.size());
            
        } catch (IOException e) {
            log.error("Failed to load location data: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Convert location name to code
     */
    public String getLocationCode(String locationName) {
        if (locationName == null || locationName.trim().isEmpty()) {
            return null;
        }
        
        String normalized = locationName.toLowerCase().trim();
        
        // Direct lookup first
        String code = nameToCodeMap.get(normalized);
        if (code != null) {
            return code;
        }
        
        // Try without accents
        String withoutAccents = removeAccents(normalized);
        code = nameToCodeMap.get(withoutAccents);
        if (code != null) {
            return code;
        }
        
        // Try partial matches
        for (Map.Entry<String, String> entry : nameToCodeMap.entrySet()) {
            String mapKey = entry.getKey();
            if (mapKey.contains(normalized) || normalized.contains(mapKey)) {
                log.debug("Found partial match: '{}' -> '{}' (code: {})", locationName, mapKey, entry.getValue());
                return entry.getValue();
            }
        }
        
        log.debug("No location code found for: '{}'", locationName);
        return null;
    }
    
    /**
     * Convert code to location name
     */
    public String getLocationName(String code) {
        return codeToNameMap.get(code);
    }
    
    /**
     * Check if location exists by name
     */
    public boolean locationExists(String locationName) {
        return getLocationCode(locationName) != null;
    }
    
    /**
     * Remove Vietnamese accents for better matching
     */
    private String removeAccents(String str) {
        return str
                .replace("à", "a").replace("á", "a").replace("ả", "a").replace("ã", "a").replace("ạ", "a")
                .replace("ă", "a").replace("ằ", "a").replace("ắ", "a").replace("ẳ", "a").replace("ẵ", "a").replace("ặ", "a")
                .replace("â", "a").replace("ầ", "a").replace("ấ", "a").replace("ẩ", "a").replace("ẫ", "a").replace("ậ", "a")
                .replace("đ", "d")
                .replace("è", "e").replace("é", "e").replace("ẻ", "e").replace("ẽ", "e").replace("ẹ", "e")
                .replace("ê", "e").replace("ề", "e").replace("ế", "e").replace("ể", "e").replace("ễ", "e").replace("ệ", "e")
                .replace("ì", "i").replace("í", "i").replace("ỉ", "i").replace("ĩ", "i").replace("ị", "i")
                .replace("ò", "o").replace("ó", "o").replace("ỏ", "o").replace("õ", "o").replace("ọ", "o")
                .replace("ô", "o").replace("ồ", "o").replace("ố", "o").replace("ổ", "o").replace("ỗ", "o").replace("ộ", "o")
                .replace("ơ", "o").replace("ờ", "o").replace("ớ", "o").replace("ở", "o").replace("ỡ", "o").replace("ợ", "o")
                .replace("ù", "u").replace("ú", "u").replace("ủ", "u").replace("ũ", "u").replace("ụ", "u")
                .replace("ư", "u").replace("ừ", "u").replace("ứ", "u").replace("ử", "u").replace("ữ", "u").replace("ự", "u")
                .replace("ỳ", "y").replace("ý", "y").replace("ỷ", "y").replace("ỹ", "y").replace("ỵ", "y");
    }
} 