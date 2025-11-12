package com.backend.benxere.configuration;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;

import java.util.Collection;
import java.util.Collections;
import java.util.stream.Collectors;

public class CustomJwtGrantedAuthoritiesConverter implements Converter<Jwt, Collection<GrantedAuthority>> {
    private final JwtGrantedAuthoritiesConverter defaultGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();

    @Override
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        System.out.println("JWT Claims: " + jwt.getClaims());
        Collection<GrantedAuthority> authorities = defaultGrantedAuthoritiesConverter.convert(jwt);
        Collection<String> scopes = jwt.getClaimAsStringList("scope");
        if (scopes != null) {
            authorities.addAll(scopes.stream()
                    .map(scope -> (GrantedAuthority) () -> "ROLE_" + scope)
                    .collect(Collectors.toList()));
        }
        System.out.println("Granted Authorities: " + authorities);
        return authorities != null ? authorities : Collections.emptyList();
    }
}