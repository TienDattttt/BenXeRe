package com.backend.benxere.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.WebSocketHandlerDecorator;
import org.springframework.web.socket.handler.WebSocketHandlerDecoratorFactory;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Map;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtDecoder jwtDecoder;
    private final CustomJwtWebSocketAuthenticationConverter authenticationConverter;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue", "/user");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS()
                .setWebSocketEnabled(true)
                .setSessionCookieNeeded(false)
                .setHeartbeatTime(25000)
                .setDisconnectDelay(5000)
                .setClientLibraryUrl("https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js");
        
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                
                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    log.info("Processing STOMP CONNECT command");
                    
                    logHeaders(accessor);
                    
                    String token = extractToken(accessor);
                    
                    if (token != null && !token.isEmpty()) {
                        try {
                            log.info("Decoding JWT token for WebSocket connection: {}", token.substring(0, Math.min(20, token.length())) + "...");
                            Jwt jwt = jwtDecoder.decode(token);
                            Authentication authentication = authenticationConverter.convert(jwt);
                            accessor.setUser(authentication);
                            log.info("WebSocket authentication successful for user: {}", authentication.getName());
                        } catch (JwtException e) {
                            log.error("WebSocket JWT authentication failed: {}", e.getMessage());
                        } catch (Exception e) {
                            log.error("WebSocket authentication failed with unexpected error: {}", e.getMessage(), e);
                        }
                    } else {
                        log.warn("No token found for WebSocket connection, proceeding as anonymous");
                    }
                }
                return message;
            }
            
            private void logHeaders(StompHeaderAccessor accessor) {
                log.info("STOMP Headers:");
                accessor.getMessageHeaders().forEach((key, value) -> {
                    log.info("  {} = {}", key, value);
                });
                
                Map<String, Object> nativeHeadersObj = accessor.getMessageHeaders().get(StompHeaderAccessor.NATIVE_HEADERS, Map.class);
                if (nativeHeadersObj != null) {
                    log.info("Native Headers:");
                    nativeHeadersObj.forEach((key, value) -> {
                        log.info("  {} = {}", key, value);
                    });
                }
            }
            
            private String extractToken(StompHeaderAccessor accessor) {
                Map<String, Object> nativeHeadersObj = accessor.getMessageHeaders().get(StompHeaderAccessor.NATIVE_HEADERS, Map.class);
                if (nativeHeadersObj != null) {
                    List<String> authHeaders = (List<String>) nativeHeadersObj.get("Authorization");
                    if (authHeaders != null && !authHeaders.isEmpty()) {
                        String authHeader = authHeaders.get(0);
                        if (authHeader != null && authHeader.startsWith("Bearer ")) {
                            log.info("Found token in Authorization header");
                            return authHeader.substring(7);
                        }
                    }
                    
                    List<String> tokenHeaders = (List<String>) nativeHeadersObj.get("token");
                    if (tokenHeaders != null && !tokenHeaders.isEmpty()) {
                        log.info("Found token in token header");
                        return tokenHeaders.get(0);
                    }
                    
                    List<String> sessionIds = (List<String>) nativeHeadersObj.get("sessionId");
                    if (sessionIds != null && !sessionIds.isEmpty()) {
                        String sessionId = sessionIds.get(0);
                        if (sessionId != null && sessionId.startsWith("token:")) {
                            log.info("Found token in sessionId");
                            return sessionId.substring(6);
                        }
                    }
                    
                    List<String> queries = (List<String>) nativeHeadersObj.get("query");
                    if (queries != null && !queries.isEmpty()) {
                        String query = queries.get(0);
                        if (query != null && query.contains("token=")) {
                            String[] params = query.split("[&?]");
                            for (String param : params) {
                                if (param.startsWith("token=")) {
                                    String token = param.substring(6);
                                    log.info("Found token in query parameter: {}", token.substring(0, Math.min(10, token.length())) + "...");
                                    return token;
                                }
                            }
                        }
                    }
                }
                
                log.warn("No token found in any header or query parameter");
                return null;
            }
        });
    }

    @Override
    public void configureWebSocketTransport(final org.springframework.web.socket.config.annotation.WebSocketTransportRegistration registration) {
        registration.addDecoratorFactory(new WebSocketHandlerDecoratorFactory() {
            @Override
            public WebSocketHandler decorate(final WebSocketHandler handler) {
                return new WebSocketHandlerDecorator(handler) {
                    @Override
                    public void afterConnectionEstablished(final WebSocketSession session) throws Exception {
                        log.info("WebSocket connection established: {}", session.getId());
                        log.debug("Connection attributes: {}", session.getAttributes());
                        log.debug("Connection headers: {}", session.getHandshakeHeaders());
                        super.afterConnectionEstablished(session);
                    }

                    @Override
                    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
                        log.info("WebSocket connection closed: {}, status: {}", session.getId(), closeStatus);
                        super.afterConnectionClosed(session, closeStatus);
                    }

                    @Override
                    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
                        log.error("WebSocket transport error: {} - {}", session.getId(), exception.getMessage(), exception);
                        super.handleTransportError(session, exception);
                    }
                };
            }
        });
    }
}