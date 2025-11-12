package com.backend.benxere.configuration;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class CustomJwtWebSocketAuthenticationConverter {

    public AbstractAuthenticationToken convert(Jwt jwt) {
        String username = jwt.getSubject();
        List<String> authorities = jwt.getClaimAsStringList("scope");
        
        Collection<GrantedAuthority> grantedAuthorities;
        if (authorities != null) {
            grantedAuthorities = authorities.stream()
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());
        } else {
            grantedAuthorities = Collections.emptyList();
        }
        
        return new UsernamePasswordAuthenticationToken(username, null, grantedAuthorities);
    }
}