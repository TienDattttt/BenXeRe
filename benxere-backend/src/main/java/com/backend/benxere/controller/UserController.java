package com.backend.benxere.controller;

import java.util.List;

import com.backend.benxere.dto.request.ApiResponse;
import com.backend.benxere.dto.request.EmployeeCreationRequest;
import com.backend.benxere.dto.request.UserCreationRequest;
import com.backend.benxere.dto.response.UserResponse;
import com.backend.benxere.service.UserService;
import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import com.backend.benxere.dto.request.UserUpdateRequest;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {
    UserService userService;

    @PostMapping
    ApiResponse<UserResponse> createUser(@RequestBody @Valid UserCreationRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.createUser(request))
                .build();
    }

    @GetMapping
    ApiResponse<List<UserResponse>> getUsers() {
        return ApiResponse.<List<UserResponse>>builder()
                .result(userService.getUsers())
                .build();
    }

    @GetMapping("/{userId}")
    ApiResponse<UserResponse> getUser(@PathVariable("userId") Integer userId) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getUser(userId))
                .build();
    }

    @GetMapping("/my-info")
    ApiResponse<UserResponse> getMyInfo() {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getMyInfo())
                .build();
    }
    
    @PostMapping("/my-info")
    ApiResponse<UserResponse> updateMyInfo(@RequestBody UserUpdateRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.updateMyInfo(request))
                .build();
    }

    @DeleteMapping("/{userId}")
    ApiResponse<String> deleteUser(@PathVariable Integer userId) {
        userService.deleteUser(userId);
        return ApiResponse.<String>builder().result("User has been deleted").build();
    }

    @PutMapping("/{userId}")
    ApiResponse<UserResponse> updateUser(@PathVariable Integer userId, @RequestBody UserUpdateRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.updateUser(userId, request))
                .build();
    }
    
    @GetMapping("/employees")
    ApiResponse<List<UserResponse>> getEmployees() {
        return ApiResponse.<List<UserResponse>>builder()
                .result(userService.getEmployees())
                .build();
    }

    @PostMapping("/employees")
    ApiResponse<UserResponse> createEmployee(@RequestBody @Valid EmployeeCreationRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.createEmployee(request))
                .build();
    }
    @GetMapping("/email/{email}")
    ApiResponse<UserResponse> getUserByEmail(@PathVariable("email") String email) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.toResponse(userService.getUserByEmail(email)))
                .build();
    }

    @GetMapping("/{userId}/employees")
    public ApiResponse<List<UserResponse>> getEmployeesByUserId(@PathVariable("userId") Integer userId) {
        return ApiResponse.<List<UserResponse>>builder()
                .result(userService.getEmployeesByUserId(userId))
                .build();
    }
}