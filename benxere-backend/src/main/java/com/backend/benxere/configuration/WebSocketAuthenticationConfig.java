package com.backend.benxere.configuration;

import com.backend.benxere.exception.AppException;
import com.backend.benxere.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.List;

@Configuration
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
@RequiredArgsConstructor
@Slf4j
public class WebSocketAuthenticationConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtDecoder jwtDecoder;
    private final JwtAuthenticationConverter jwtAuthenticationConverter;

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                
                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    log.info("Processing WebSocket CONNECT command");
                    
                    List<String> authorization = accessor.getNativeHeader("Authorization");
                    if (authorization != null && !authorization.isEmpty()) {
                        String authHeader = authorization.get(0);
                        
                        if (authHeader != null && authHeader.startsWith("Bearer ")) {
                            String token = authHeader.substring(7);
                            try {
                                log.info("Validating JWT token for WebSocket: {}", token.substring(0, Math.min(10, token.length())) + "...");
                                Jwt jwt = jwtDecoder.decode(token);
                                
                                Authentication auth = jwtAuthenticationConverter.convert(jwt);
                                accessor.setUser(auth);
                                SecurityContextHolder.getContext().setAuthentication(auth);
                                
                                log.info("Successfully authenticated WebSocket connection for user: {}", auth.getName());
                            } catch (Exception e) {
                                log.error("Failed to authenticate WebSocket connection: {}", e.getMessage());
                                throw new AppException(ErrorCode.UNAUTHORIZED, "Invalid authentication token");
                            }
                        }
                    } else {
                        log.info("No Authorization header found for WebSocket connection, proceeding as anonymous");
                    }
                }
                
                return message;
            }
        });
    }
}