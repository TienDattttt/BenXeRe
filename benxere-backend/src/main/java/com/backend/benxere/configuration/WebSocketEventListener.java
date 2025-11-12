package com.backend.benxere.configuration;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
@RequiredArgsConstructor
public class WebSocketEventListener {

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Authentication auth = (Authentication) headerAccessor.getUser();
        String sessionId = headerAccessor.getSessionId();
        
        if (auth != null) {
            log.info("User attempting to connect: {}, sessionId: {}", auth.getName(), sessionId);
            headerAccessor.getMessageHeaders().forEach((key, value) ->
                log.debug("Header - {}: {}", key, value));
        } else {
            log.warn("No authentication found in connect event, sessionId: {}", sessionId);
        }
    }

    @EventListener
    public void handleWebSocketConnectedListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Authentication auth = (Authentication) headerAccessor.getUser();
        String sessionId = headerAccessor.getSessionId();
        
        if (auth != null) {
            log.info("User connected successfully: {}, sessionId: {}", auth.getName(), sessionId);
        } else {
            log.warn("Connected session without authentication, sessionId: {}", sessionId);
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Authentication auth = (Authentication) headerAccessor.getUser();
        String sessionId = headerAccessor.getSessionId();
        
        if (auth != null) {
            log.info("User disconnected: {}, sessionId: {}", auth.getName(), sessionId);
        } else {
            log.warn("Disconnected session without authentication, sessionId: {}", sessionId);
        }
    }
}