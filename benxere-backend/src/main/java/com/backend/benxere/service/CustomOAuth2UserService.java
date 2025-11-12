package com.backend.benxere.service;

import com.backend.benxere.constant.PredefinedRole;
import com.backend.benxere.entity.Role;
import com.backend.benxere.entity.User;
import com.backend.benxere.repository.RoleRepository;
import com.backend.benxere.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = oauth2User.getAttributes();

        String email = extractEmail(attributes);
        if (email == null || email.trim().isEmpty()) {
            throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
        }

        Optional<User> existingUser = userRepository.findByEmail(email);

        if (existingUser.isPresent()) {
            updateExistingUser(existingUser.get(), attributes);
            return oauth2User;
        }

        createNewUser(email, attributes);
        return oauth2User;
    }

    private void updateExistingUser(User user, Map<String, Object> attributes) {
        String firstName = extractFirstName(attributes);
        String lastName = extractLastName(attributes);

        if (firstName != null) user.setFirstName(firstName);
        if (lastName != null) user.setLastName(lastName);

        userRepository.save(user);
    }

    private void createNewUser(String email, Map<String, Object> attributes) {
        Role customerRole = roleRepository.findByName(PredefinedRole.CUSTOMER_ROLE)
                .orElseThrow(() -> new OAuth2AuthenticationException("Default role not found"));

        User newUser = User.builder()
                .email(email)
                .firstName(extractFirstName(attributes))
                .lastName(extractLastName(attributes))
                // .status("ACTIVE")
                // .role(customerRole)
                .createdAt(Timestamp.from(Instant.now()))
                .build();

        userRepository.save(newUser);
    }

    private String extractEmail(Map<String, Object> attributes) {
        if (attributes.containsKey("email") && attributes.get("email") != null) {
            return (String) attributes.get("email");
        }

        System.out.println("OAuth2 attributes: " + attributes);
        if (attributes.containsKey("login")) {
            String login = (String) attributes.get("login");
            return login + "@github.user";
        }

        if (attributes.containsKey("sub")) {
            return (String) attributes.get("sub") + "@oauth.user";
        }

        return null;
    }

    private String extractFirstName(Map<String, Object> attributes) {
        if (attributes.containsKey("given_name")) {
            return (String) attributes.get("given_name");
        }
        if (attributes.containsKey("name")) {
            String fullName = (String) attributes.get("name");
            if (fullName != null && !fullName.trim().isEmpty()) {
                return fullName.split(" ")[0];
            }
        }

        if (attributes.containsKey("login")) {
            return (String) attributes.get("login");
        }

        return "OAuth";
    }

    private String extractLastName(Map<String, Object> attributes) {
        if (attributes.containsKey("family_name")) {
            return (String) attributes.get("family_name");
        }

        if (attributes.containsKey("name")) {
            String fullName = (String) attributes.get("name");
            if (fullName != null && !fullName.trim().isEmpty()) {
                String[] parts = fullName.split(" ");
                return parts.length > 1 ? parts[parts.length - 1] : "";
            }
        }

        return "User";
    }
}