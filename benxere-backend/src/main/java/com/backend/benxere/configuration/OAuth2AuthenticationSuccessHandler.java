package com.backend.benxere.configuration;

import com.backend.benxere.service.AuthenticationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final AuthenticationService authenticationService;
    
    @Value("${spring.security.oauth2.authorized-redirect-uris}")
    private String redirectUri;
    
    @Value("${spring.security.oauth2.remember-me:true}")
    private boolean rememberMeByDefault;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        try {
            if (response.isCommitted()) {
                logger.debug("Response has already been committed");
                return;
            }

            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
            String email = extractEmail(oAuth2User);

            String token = authenticationService.generateTokenForOAuth2User(email, rememberMeByDefault);

            String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                    .queryParam("token", token)
                    .build().toUriString();

            getRedirectStrategy().sendRedirect(request, response, targetUrl);

        } catch (Exception ex) {
            logger.error("Could not redirect after OAuth2 login", ex);
            getRedirectStrategy().sendRedirect(request, response,
                    redirectUri + "?error=authentication_failed");
        }
    }

    private String extractEmail(OAuth2User oAuth2User) {
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = oAuth2User.getAttribute("email");
        if (email != null) {
            return email;
        }

        if (attributes.containsKey("login")) {
            String login = (String) attributes.get("login");
            return login + "@github.user";
        }

        logger.info("OAuth2 attributes: " + attributes);

        throw new IllegalArgumentException("Email could not be extracted from OAuth2 user info");
    }
}