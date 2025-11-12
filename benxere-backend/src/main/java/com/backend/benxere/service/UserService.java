package com.backend.benxere.service;

import com.backend.benxere.dto.request.EmployeeCreationRequest;
import com.backend.benxere.dto.request.UserCreationRequest;
import com.backend.benxere.dto.request.UserUpdateRequest;
import com.backend.benxere.dto.response.UserResponse;
import com.backend.benxere.entity.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import java.util.List;

public interface UserService extends UserDetailsService {
    UserResponse createUser(UserCreationRequest request);
    UserResponse updateUser(Integer userId, UserUpdateRequest request);
    void deleteUser(Integer userId);
    UserResponse getUser(Integer userId);
    List<UserResponse> getUsers();
    
    User getCurrentUser();
    UserResponse getMyInfo();
    UserResponse updateMyInfo(UserUpdateRequest request);
    User getUserById(Integer id);
    User getUserByEmail(String email);
    boolean isCurrentUser(Integer userId);
    List<UserResponse> getEmployeesByUserId(Integer userId);
    void initiatePasswordReset(String email);
    void resetPassword(String email,String newPassword);
    boolean verifyOtp(String email, String otp);
    
    List<UserResponse> getEmployees();
    UserResponse createEmployee(EmployeeCreationRequest request);
    List<UserResponse> getEmployeesByCurrentUser();
    
    UserResponse toResponse(User user);
    List<UserResponse> toResponseList(List<User> users);
}