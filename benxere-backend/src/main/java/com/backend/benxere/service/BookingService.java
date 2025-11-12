package com.backend.benxere.service;

import com.backend.benxere.dto.request.BookingCreationRequest;
import com.backend.benxere.dto.response.BookingResponse;
import com.backend.benxere.dto.response.BookingWithPaymentResponse;
import com.backend.benxere.entity.Payment;
import com.backend.benxere.entity.User;

import java.util.List;

public interface BookingService {
    BookingResponse createBooking(BookingCreationRequest request);
    BookingResponse createBookingForCustomer(BookingCreationRequest request, User customer);
    List<BookingResponse> getAllBookings();
    BookingResponse getBookingById(int id);
    BookingResponse updateBooking(int id, BookingCreationRequest request);
    void deleteBooking(int id);
    List<BookingResponse> getBookingsByScheduleId(int scheduleId);
    List<BookingResponse> getBookingsByCurrentUser();
    List<BookingWithPaymentResponse> getBookingsWithPaymentByCurrentUser();
    
    void createTemporaryBooking(Payment payment);
    void confirmBooking(Payment payment);
    void deleteExpiredBookings();
    boolean isBookingValid(Integer relatedEntityId);
}