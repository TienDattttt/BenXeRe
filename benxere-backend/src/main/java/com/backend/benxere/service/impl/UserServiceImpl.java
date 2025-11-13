package com.backend.benxere.service.impl;

import com.backend.benxere.configuration.CustomUserPrincipal;
import com.backend.benxere.dto.request.EmployeeCreationRequest;
import com.backend.benxere.dto.request.UserCreationRequest;
import com.backend.benxere.dto.request.UserUpdateRequest;
import com.backend.benxere.dto.response.UserResponse;
import com.backend.benxere.entity.User;
import com.backend.benxere.entity.Role;
import com.backend.benxere.exception.AppException;
import com.backend.benxere.exception.ErrorCode;
import com.backend.benxere.mapper.UserMapper;
import com.backend.benxere.repository.RoleRepository;
import com.backend.benxere.repository.UserRepository;
import com.backend.benxere.service.BusService;
import com.backend.benxere.service.OtpService;
import com.backend.benxere.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
      private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final RoleRepository roleRepository;
    private final OtpService otpService;
    private final BusService busService;
    private final PasswordEncoder passwordEncoder;    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().getName());
        
        return new CustomUserPrincipal(
            user.getUserId(),
            user.getEmail(),
            user.getPasswordHash(),
            Collections.singletonList(authority)
        );
    }

    @Override
    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Current user not found"));
    }

    @Override
    public UserResponse getMyInfo() {
        return toResponse(getCurrentUser());
    }

    @Override
    public UserResponse updateMyInfo(UserUpdateRequest request) {
        User user = getCurrentUser();
        userMapper.updateUserFromDto(request, user);
        user.setStatus("ACTIVE");
        return toResponse(userRepository.save(user));
    }

    @Override
    public User getUserById(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));
    }

    @Override
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + email));
    }    @Override
    public boolean isCurrentUser(Integer userId) {
        return getCurrentUser().getUserId() == userId.intValue();
    }

    @Override
    @Transactional
    public UserResponse createUser(UserCreationRequest request) {

        User user = userMapper.toUser(request);

        // SET ROLE
        if (request.getRoleId() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Role ID is required");
        }

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new EntityNotFoundException("Role not found"));
        user.setRole(role);

        // Encode password
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        // Status default
        if (user.getStatus() == null) user.setStatus("ACTIVE");

        return toResponse(userRepository.save(user));
    }


    @Override
    @Transactional
    public UserResponse updateUser(Integer userId, UserUpdateRequest request) {
        User user = getUserById(userId);
        
        userMapper.updateUserFromDto(request, user);
        
        if (request.getRoleId() != null && !request.getRoleId().isEmpty()) {
            Role newRole = roleRepository.findById(Integer.parseInt(request.getRoleId()))
                    .orElseThrow(() -> new EntityNotFoundException("Role not found"));
            user.setRole(newRole);
            
            if (newRole.getName().equals("CUSTOMER_CARE")) {
                if (user.getWorkStartTime() == null || user.getWorkEndTime() == null) {
                    if (request.getWorkStartTime() == null || request.getWorkEndTime() == null) {
                        throw new AppException(ErrorCode.INVALID_REQUEST, "Working hours must be set for Customer Care staff");
                    }
                }
            } else {
                user.setWorkStartTime(null);
                user.setWorkEndTime(null);
            }
        } else {
            if (user.getRole() != null && "CUSTOMER_CARE".equals(user.getRole().getName())) {
                if ((request.getWorkStartTime() != null && request.getWorkEndTime() == null) || 
                    (request.getWorkStartTime() == null && request.getWorkEndTime() != null)) {
                    throw new AppException(ErrorCode.INVALID_REQUEST, "Both start and end working hours must be provided");
                }
            } else {
                user.setWorkStartTime(null);
                user.setWorkEndTime(null);
            }
        }
        
        return toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public void deleteUser(Integer userId) {
        userRepository.deleteById(userId);
    }

    @Override
    public UserResponse getUser(Integer userId) {
        return toResponse(getUserById(userId));
    }

    @Override
    public List<UserResponse> getUsers() {
        return toResponseList(userRepository.findAll());
    }

    @Override
    public List<UserResponse> getEmployees() {
        User currentUser = getCurrentUser();
        return toResponseList(currentUser.getEmployees());
    }

    @Override
    @Transactional
    public UserResponse createEmployee(EmployeeCreationRequest request) {
        User employee = userMapper.toUser(request);
        String passWoString ="12345678";
        employee.setPasswordHash(passwordEncoder.encode(passWoString));
        employee.setManager(getCurrentUser());
        
        String baseEmail = Arrays.stream(request.getLastName().toLowerCase().split("\\s+"))
            .map(word -> word.substring(0, 1))
            .collect(Collectors.joining("")) + 
            request.getFirstName().toLowerCase() + "@" + 
            busService.getBusByCurrentUser().get(0).getCompanyName().toLowerCase().replaceAll("\\s+", "") + ".com";
            
        String email = baseEmail;
        int counter = 1;
        while (userRepository.findByEmail(email).isPresent()) {
            email = baseEmail.replace("@", counter + "@");
            counter++;
        }
        
        employee.setEmail(email);
        if (request.getRoleId() != null && !request.getRoleId().isEmpty()) {
            Role newRole = roleRepository.findById(Integer.parseInt(request.getRoleId()))
                    .orElseThrow(() -> new EntityNotFoundException("Role not found"));
            employee.setRole(newRole);
            
            if (newRole.getName().equals("CUSTOMER_CARE")) {
                if (request.getWorkStartTime() == null || request.getWorkEndTime() == null) {
                    throw new AppException(ErrorCode.INVALID_REQUEST, "Working hours must be set for Customer Care staff");
                }
            } else {
                employee.setWorkStartTime(null);
                employee.setWorkEndTime(null);
            }
        }
        return toResponse(userRepository.save(employee));
    }

    @Override
    public List<UserResponse> getEmployeesByCurrentUser() {
        return toResponseList(userRepository.findAllByEmployer(getCurrentUser()));
    }    @Override
    public void initiatePasswordReset(String email) {
        userRepository.findByEmail(email)
            .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + email));
        
        otpService.generateAndSendOtp(email);
    }    @Override
    public boolean verifyOtp(String email, String otp) {
        try {
            otpService.validateOtp(email, otp);
            return true;
        } catch (AppException e) {
            if (e.getCode() == ErrorCode.INVALID_OTP.getCode() || 
                e.getCode() == ErrorCode.OTP_EXPIRED.getCode()) {
                return false;
            }
            throw e;
        }
    }

    @Override
    public void resetPassword(String email,  String newPassword) {
        
        User user = getUserByEmail(email);
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    public UserResponse toResponse(User user) {
        return userMapper.toUserResponse(user);
    }

    @Override
    public List<UserResponse> toResponseList(List<User> users) {
        return users.stream().map(this::toResponse).toList();
    }
    @Override
    public List<UserResponse> getEmployeesByUserId(Integer userId) {
        User user = getUserById(userId);
        return toResponseList(user.getEmployees());
    }
    
}