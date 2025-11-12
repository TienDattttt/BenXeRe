package com.backend.benxere.service;

import java.sql.Timestamp;
import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.StringJoiner;
import java.util.UUID;

import com.backend.benxere.constant.PredefinedRole;
import com.backend.benxere.dto.request.*;
import com.backend.benxere.dto.response.AuthenticationResponse;
import com.backend.benxere.dto.response.IntrospectResponse;
import com.backend.benxere.entity.InvalidatedToken;
import com.backend.benxere.entity.Role;
import com.backend.benxere.entity.User;
import com.backend.benxere.exception.AppException;
import com.backend.benxere.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.backend.benxere.exception.ErrorCode;
import com.backend.benxere.repository.InvalidatedTokenRepository;
import com.backend.benxere.repository.UserRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService {
    UserRepository userRepository;
    RoleRepository roleRepository;
    InvalidatedTokenRepository invalidatedTokenRepository;
    UserService userService;

    @NonFinal
    @Value("${jwt.signerKey}")
    protected String SIGNER_KEY;

    @NonFinal
    @Value("${jwt.valid-duration}")
    protected long VALID_DURATION;

    @NonFinal
    @Value("${jwt.refreshable-duration}")
    protected long REFRESHABLE_DURATION;
    
    @NonFinal
    @Value("${jwt.remember-me-duration:604800}") 
    protected long REMEMBER_ME_DURATION;
    
    @NonFinal
    @Value("${jwt.remember-me-refreshable-duration:2592000}") 
    protected long REMEMBER_ME_REFRESHABLE_DURATION;

    public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException {
        var token = request.getToken();
        boolean isValid = true;

        try {
            verifyToken(token, false);
        } catch (AppException e) {
            isValid = false;
        }

        return IntrospectResponse.builder().valid(isValid).build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        var user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPasswordHash());

        if (!authenticated) throw new AppException(ErrorCode.UNAUTHENTICATED);

        var token = generateToken(user, request.isRememberMe());

        return AuthenticationResponse.builder().token(token).authenticated(true).build();
    }

    public void logout(LogoutRequest request) throws ParseException, JOSEException {
        try {
            var signToken = verifyToken(request.getToken(), true);

            String jit = signToken.getJWTClaimsSet().getJWTID();
            Date expiryTime = signToken.getJWTClaimsSet().getExpirationTime();

            InvalidatedToken invalidatedToken =
                    InvalidatedToken.builder().id(jit).expiryTime(expiryTime).build();

            invalidatedTokenRepository.save(invalidatedToken);
        } catch (AppException exception) {
            log.info("Token already expired");
        }
    }

    public AuthenticationResponse refreshToken(RefreshRequest request) throws ParseException, JOSEException {
        var signedJWT = verifyToken(request.getToken(), true);

        var jit = signedJWT.getJWTClaimsSet().getJWTID();
        var expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        InvalidatedToken invalidatedToken =
                InvalidatedToken.builder().id(jit).expiryTime(expiryTime).build();

        invalidatedTokenRepository.save(invalidatedToken);

        var username = signedJWT.getJWTClaimsSet().getSubject();
        
        boolean isRememberMe = signedJWT.getJWTClaimsSet().getClaim("rememberMe") != null && 
                (boolean) signedJWT.getJWTClaimsSet().getClaim("rememberMe");

        var user =
                userRepository.findByEmail(username).orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        var token = generateToken(user, isRememberMe);

        return AuthenticationResponse.builder().token(token).authenticated(true).build();
    }

    private String generateToken(User user) {
        return generateToken(user, false);
    }

    private String generateToken(User user, boolean rememberMe) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS256);

        long tokenDuration = rememberMe ? REMEMBER_ME_DURATION : VALID_DURATION;

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getEmail())
                .issuer("benxeso.com")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(tokenDuration, ChronoUnit.SECONDS).toEpochMilli()))
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", buildScope(user))
                .claim("rememberMe", rememberMe)
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Cannot create token", e);
            throw new RuntimeException(e);
        }
    }

    private SignedJWT verifyToken(String token, boolean isRefresh) throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);
        
        boolean isRememberMe = signedJWT.getJWTClaimsSet().getClaim("rememberMe") != null && 
                              (boolean) signedJWT.getJWTClaimsSet().getClaim("rememberMe");
        
        long refreshDuration = isRememberMe ? REMEMBER_ME_REFRESHABLE_DURATION : REFRESHABLE_DURATION;

        Date expiryTime = (isRefresh)
                ? new Date(signedJWT
                        .getJWTClaimsSet()
                        .getIssueTime()
                        .toInstant()
                        .plus(refreshDuration, ChronoUnit.SECONDS)
                        .toEpochMilli())
                : signedJWT.getJWTClaimsSet().getExpirationTime();

        var verified = signedJWT.verify(verifier);

        if (!(verified && expiryTime.after(new Date()))) throw new AppException(ErrorCode.UNAUTHENTICATED);

        if (invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID()))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        return signedJWT;
    }

    private String buildScope(User user) {
        StringJoiner stringJoiner = new StringJoiner(" ");

        if (user.getRole() != null) {
            stringJoiner.add("ROLE_" + user.getRole().getName());
        }

        return stringJoiner.toString();
    }
    public AuthenticationResponse signUp(SignUpRequest request) {
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
    
        Role defaultRole = roleRepository.findByName(PredefinedRole.CUSTOMER_ROLE)
            .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
    
        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phoneNumber(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(defaultRole)
                .createdAt(new Timestamp(System.currentTimeMillis()))
                .build();
    
        System.out.println("User: " + user + ", First Name: " + user.getFirstName() + ", Last Name: " + user.getLastName() + ", Email: " + user.getEmail() + ", Phone: " + user.getPhoneNumber() + ", Password Hash: " + user.getPasswordHash() + ", Role ID: " + user.getRole().getId());
    
        userRepository.save(user);
    
        var token = generateToken(user);
    
        return AuthenticationResponse.builder().token(token).authenticated(true).build();
    }
    public String getUserIdFromToken(String token) {
        try {
            SignedJWT signedJWT = verifyToken(token.replace("Bearer ", ""), false);
            return signedJWT.getJWTClaimsSet().getStringClaim("userId");
        } catch (ParseException | JOSEException e) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
    }

    public String generateTokenForOAuth2User(String email) {
        return generateTokenForOAuth2User(email, false);
    }

    public String generateTokenForOAuth2User(String email, boolean rememberMe) {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return generateToken(user, rememberMe);
    }

    public void forgotPassword(String email) {
        userService.initiatePasswordReset(email);
    }

    public boolean verifyOtp(String email, String otp) {
        return userService.verifyOtp(email, otp);
    }

    public void resetPassword(String email, String newPassword) {
        userService.resetPassword(email, newPassword);
    }
}
