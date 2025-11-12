package com.backend.benxere.service.impl;

import com.backend.benxere.dto.request.BookingCreationRequest;
import com.backend.benxere.dto.response.BookingResponse;
import com.backend.benxere.dto.response.BookingWithPaymentResponse;
import com.backend.benxere.dto.response.PaymentResponse;
import com.backend.benxere.entity.*;
import com.backend.benxere.exception.AppException;
import com.backend.benxere.exception.ErrorCode;
import com.backend.benxere.repository.*;
import com.backend.benxere.service.BookingService;
import com.backend.benxere.service.CouponService;
import com.backend.benxere.service.EmailService;
import com.backend.benxere.service.PaymentService;
import com.backend.benxere.service.qrcode.BookingEmailHelper;
import com.backend.benxere.service.qrcode.QRCodeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingServiceImpl implements BookingService {
    private static final Logger logger = LoggerFactory.getLogger(BookingServiceImpl.class);

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ScheduleRepository scheduleRepository;
    private final LocationRepository locationRepository;
    private final SeatRepository seatRepository;
    private final CouponRepository couponRepository;
    private final CouponService couponService;
    private final QRCodeService qrCodeService;
    private final EmailService emailService;
    private final BookingEmailHelper bookingEmailHelper;
    private final PaymentService paymentService;
    
    public BookingServiceImpl(BookingRepository bookingRepository, 
                             UserRepository userRepository,
                             ScheduleRepository scheduleRepository,
                             LocationRepository locationRepository,
                             SeatRepository seatRepository,
                             CouponRepository couponRepository,
                             CouponService couponService,
                             QRCodeService qrCodeService,
                             EmailService emailService,
                             BookingEmailHelper bookingEmailHelper,
                             @Lazy PaymentService paymentService) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.scheduleRepository = scheduleRepository;
        this.locationRepository = locationRepository;
        this.seatRepository = seatRepository;
        this.couponRepository = couponRepository;
        this.couponService = couponService;
        this.qrCodeService = qrCodeService;
        this.emailService = emailService;
        this.bookingEmailHelper = bookingEmailHelper;
        this.paymentService = paymentService;
    }

    @Override
    @Transactional
    public void createTemporaryBooking(Payment payment) {
        Booking booking = bookingRepository.findById(payment.getRelatedEntityId())
            .orElseThrow(() -> new RuntimeException("Booking not found: " + payment.getRelatedEntityId()));
        
        booking.setTemporary(true);
        booking.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        booking.setStatus(Booking.BookingStatus.Pending);
        bookingRepository.save(booking);
        
        logger.info("Created temporary booking: {}", booking.getBookingId());
    }

    @Override
    @Transactional
    public void confirmBooking(Payment payment) {
        Booking booking = bookingRepository.findById(payment.getRelatedEntityId())
            .orElseThrow(() -> new RuntimeException("Booking not found: " + payment.getRelatedEntityId()));
        
        booking.setTemporary(false);
        String firstSeatQrCode = null;        for (Seat seat : booking.getSeats()) {
            seat.setBooked(true);
            seat.setBookedBy(booking.getUser());
            seat.setBookedAt(LocalDateTime.now());
            seat.setPassengerStatus("CONFIRMED");
            
            try {
                String qrCodeData = qrCodeService.generateQRCodeForSeat(seat);
                seat.setQrCodeData(qrCodeData);
                seat.setQrCodeScannedCount(0);
                
                if (firstSeatQrCode == null) {
                    firstSeatQrCode = qrCodeData;
                }
                
                logger.info("Generated QR code for seat ID: {}", seat.getSeatId());
            } catch (Exception e) {
                logger.error("Failed to generate QR code for seat ID: {}", seat.getSeatId(), e);
            }
        }
        
        seatRepository.saveAll(booking.getSeats());
        booking.setStatus(Booking.BookingStatus.Confirmed);
        bookingRepository.save(booking);
        
        try {
            User user = booking.getUser();
            if (user != null && user.getEmail() != null && !user.getEmail().isEmpty()) {
                String bookingDetailsHtml = bookingEmailHelper.generateBookingDetailsHtml(booking, booking.getSeats().get(0));
                
                String userName = user.getFirstName() + " " + user.getLastName();
                emailService.sendBookingConfirmationEmail(
                    user.getEmail(),
                    userName,
                    bookingDetailsHtml,
                    firstSeatQrCode  
                );
                
                logger.info("Sent booking confirmation email to user: {}", user.getEmail());
            }
        } catch (Exception e) {
            logger.error("Failed to send booking confirmation email: {}", e.getMessage(), e);
        }
        
        logger.info("Confirmed booking: {}", booking.getBookingId());
    }    @Override
    @Transactional
    public void deleteExpiredBookings() {
        // Note: This method is no longer needed as seats are only booked upon payment success
        // Keeping it for backward compatibility but it does nothing
        logger.info("deleteExpiredBookings called but no longer needed - seats are only booked upon payment success");
    }    @Override
    public boolean isBookingValid(Integer bookingId) {
        if (bookingId == null) {
            return false;
        }
        
        return bookingRepository.findById(bookingId)
            .map(booking -> {
                // A booking is valid if it exists
                return true;
            })
            .orElse(false);
    }

    @Override
    public BookingResponse createBooking(BookingCreationRequest request) {
        Booking booking = new Booking();
        booking.setSchedule(scheduleRepository.findById(request.getScheduleId())
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Schedule not found")));
        booking.setUser(userRepository.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName())
            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED, "User not found")));
        booking.setPickUpLocation(locationRepository.findById(request.getPickUpLocationId())
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Pick-up location not found")));
        booking.setDropOffLocation(locationRepository.findById(request.getDropOffLocationId())
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Drop-off location not found")));        List<Seat> seats = seatRepository.findAllById(request.getSeatIds());
        if (seats.size() != request.getSeatIds().size()) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Some seats not found");
        }
        
        // Check if any seats are already booked
        for (Seat seat : seats) {
            if (seat.isBooked()) {
                throw new AppException(ErrorCode.BAD_REQUEST, "Seat " + seat.getSeatNumber() + " is already booked");
            }
        }
        
        // Do NOT mark seats as booked here - they will be marked as booked only when payment is successful
        booking.setSeats(seats);
        
        double pricePerSeat = booking.getSchedule().getPricePerSeat();
        double originalPrice = seats.stream()
            .mapToDouble(seat -> pricePerSeat)
            .sum();
        booking.setOriginalPrice(originalPrice);
        
        double discountAmount = 0.0;
        Coupon coupon = null;
        
        if (request.getCouponId() > 0) {
            coupon = couponRepository.findById(request.getCouponId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Coupon not found"));
        } else if (request.getCouponCode() != null && !request.getCouponCode().isEmpty()) {
            coupon = couponRepository.findByCode(request.getCouponCode())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Coupon not found with code: " + request.getCouponCode()));
        }
        
        if (coupon != null) {
            BigDecimal discount = couponService.validateCouponAndCalculateDiscount(
                coupon.getCode(), 
                BigDecimal.valueOf(originalPrice)
            );
            
            discountAmount = discount.doubleValue();
            booking.setCoupon(coupon);
        }
        
        double totalPrice = originalPrice - discountAmount;
        booking.setDiscountAmount(discountAmount);
        booking.setTotalPrice(totalPrice);
        
        booking.setBookingDate(new Timestamp(System.currentTimeMillis()));
        booking.setStatus(request.getStatus() != null ? request.getStatus() : Booking.BookingStatus.Pending);
        booking.setTemporary(true);
        booking.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        booking.setIsRated(false); // Initialize isRated to false
        
        booking = bookingRepository.save(booking);
        return mapToBookingResponse(booking);
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
            .map(this::mapToBookingResponse)
            .collect(Collectors.toList());
    }

    @Override
    public BookingResponse getBookingById(int id) {
        return bookingRepository.findById(id)
            .map(this::mapToBookingResponse)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    @Override
    public BookingResponse updateBooking(int id, BookingCreationRequest request) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        if (booking.getTemporary() == null || !booking.getTemporary()) {
            throw new RuntimeException("Cannot update confirmed booking");
        }
        
        booking.setPickUpLocation(locationRepository.findById(request.getPickUpLocationId())
            .orElseThrow(() -> new RuntimeException("Pick-up location not found")));
        booking.setDropOffLocation(locationRepository.findById(request.getDropOffLocationId())
            .orElseThrow(() -> new RuntimeException("Drop-off location not found")));
        
        List<Seat> seats = seatRepository.findAllById(request.getSeatIds());
        if (seats.size() != request.getSeatIds().size()) {
            throw new RuntimeException("Some seats not found");
        }
        booking.setSeats(seats);
        
        double pricePerSeat = booking.getSchedule().getPricePerSeat();
        double totalPrice = seats.stream()
            .mapToDouble(seat -> pricePerSeat)
            .sum();
        booking.setTotalPrice(totalPrice);
        
        booking = bookingRepository.save(booking);
        return mapToBookingResponse(booking);
    }

    @Override
    public void deleteBooking(int id) {
        bookingRepository.deleteById(id);
        logger.info("Deleted booking: {}", id);
    }

    @Override
    public List<BookingResponse> getBookingsByScheduleId(int scheduleId) {
        return bookingRepository.getBookingsByScheduleScheduleId(scheduleId).stream()
            .map(this::mapToBookingResponse)
            .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> getBookingsByCurrentUser() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return bookingRepository.getBookingsByUserEmail(userEmail).stream()
            .map(this::mapToBookingResponse)
            .collect(Collectors.toList());
    }

    @Override
    public List<BookingWithPaymentResponse> getBookingsWithPaymentByCurrentUser() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        List<Booking> bookings = bookingRepository.getBookingsByUserEmail(userEmail);
        
        return bookings.stream()
            .map(booking -> {
                BookingResponse bookingResponse = mapToBookingResponse(booking);
                PaymentResponse paymentResponse = paymentService.getPaymentByRelatedEntityId(booking.getBookingId());
                
                BookingWithPaymentResponse response = new BookingWithPaymentResponse();
                response.setBooking(bookingResponse);
                response.setPayment(paymentResponse);
                
                return response;
            })
            .collect(Collectors.toList());
    }

    @Override
    public BookingResponse createBookingForCustomer(BookingCreationRequest request, User customer) {
        Booking booking = new Booking();
        booking.setSchedule(scheduleRepository.findById(request.getScheduleId())
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Schedule not found")));
        booking.setUser(customer);
        booking.setPickUpLocation(locationRepository.findById(request.getPickUpLocationId())
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Pick-up location not found")));
        booking.setDropOffLocation(locationRepository.findById(request.getDropOffLocationId())
            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Drop-off location not found")));        List<Seat> seats = seatRepository.findAllById(request.getSeatIds());
            
        if (seats.size() != request.getSeatIds().size()) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Some seats not found");
        }
        
        // Check if any seats are already booked
        for (Seat seat : seats) {
            if (seat.isBooked()) {
                throw new AppException(ErrorCode.BAD_REQUEST, "Seat " + seat.getSeatNumber() + " is already booked");
            }
        }
        
        // Do NOT mark seats as booked here - they will be marked as booked only when payment is successful
        booking.setSeats(seats);
        
        double pricePerSeat = booking.getSchedule().getPricePerSeat();
        double originalPrice = seats.stream()
            .mapToDouble(seat -> pricePerSeat)
            .sum();
        booking.setOriginalPrice(originalPrice);
        
        double discountAmount = 0.0;
        Coupon coupon = null;
        
        if (request.getCouponId() > 0) {
            coupon = couponRepository.findById(request.getCouponId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Coupon not found"));
        } else if (request.getCouponCode() != null && !request.getCouponCode().isEmpty()) {
            coupon = couponRepository.findByCode(request.getCouponCode())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Coupon not found with code: " + request.getCouponCode()));
        }
        
        if (coupon != null) {
            BigDecimal discount = couponService.validateCouponAndCalculateDiscount(
                coupon.getCode(), 
                BigDecimal.valueOf(originalPrice)
            );
            
            discountAmount = discount.doubleValue();
            booking.setCoupon(coupon);
        }
        
        double totalPrice = originalPrice - discountAmount;
        booking.setDiscountAmount(discountAmount);
        booking.setTotalPrice(totalPrice);
        
        booking.setBookingDate(new Timestamp(System.currentTimeMillis()));
        booking.setStatus(request.getStatus() != null ? request.getStatus() : Booking.BookingStatus.Pending);
        booking.setTemporary(true);
        booking.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        booking.setIsRated(false); 
        
        booking = bookingRepository.save(booking);
        return mapToBookingResponse(booking);
    }    private BookingResponse mapToBookingResponse(Booking booking) {
        BookingResponse.BookingResponseBuilder builder = BookingResponse.builder()
            .bookingId(booking.getBookingId())
            .userId(booking.getUser().getUserId())
            .scheduleId(booking.getSchedule().getScheduleId())
            .originalPrice(booking.getOriginalPrice() != null ? booking.getOriginalPrice() : 0.0)
            .discountAmount(booking.getDiscountAmount() != null ? booking.getDiscountAmount() : 0.0)
            .totalPrice(booking.getTotalPrice() != null ? booking.getTotalPrice() : 0.0)
            .bookingDate(booking.getBookingDate())
            .status(booking.getStatus())
            .seatIds(booking.getSeats().stream()
                .map(Seat::getSeatId)
                .collect(Collectors.toList()))
            .pickUpLocationId(booking.getPickUpLocation().getLocationId())
            .dropOffLocationId(booking.getDropOffLocation().getLocationId())
            .isRated(booking.getIsRated() != null ? booking.getIsRated() : false);
        
        if (booking.getCoupon() != null) {
            builder.couponId(booking.getCoupon().getId());
            builder.couponCode(booking.getCoupon().getCode());
        }
        
        return builder.build();
    }
}