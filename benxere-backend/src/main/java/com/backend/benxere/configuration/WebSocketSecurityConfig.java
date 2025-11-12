package com.backend.benxere.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.security.config.annotation.web.messaging.MessageSecurityMetadataSourceRegistry;
import org.springframework.security.config.annotation.web.socket.AbstractSecurityWebSocketMessageBrokerConfigurer;

@Configuration
public class WebSocketSecurityConfig extends AbstractSecurityWebSocketMessageBrokerConfigurer {

    @Override
    protected void configureInbound(MessageSecurityMetadataSourceRegistry messages) {
        messages
            .simpTypeMatchers(
                SimpMessageType.CONNECT,
                SimpMessageType.DISCONNECT,
                SimpMessageType.HEARTBEAT
            ).permitAll()
            .simpSubscribeDestMatchers("/user/*/queue/messages").authenticated()
            .simpSubscribeDestMatchers("/topic/public").permitAll()
            .simpDestMatchers("/app/chat.connect").permitAll()
            .simpDestMatchers("/app/chat.send").authenticated()
            .simpDestMatchers("/app/chat.read").authenticated()
            .anyMessage().permitAll();
    }

    @Override
    protected boolean sameOriginDisabled() {
        return true;
    }
}