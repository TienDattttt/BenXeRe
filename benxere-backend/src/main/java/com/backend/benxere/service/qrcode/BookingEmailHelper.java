package com.backend.benxere.service.qrcode;

import com.backend.benxere.entity.Booking;
import com.backend.benxere.entity.Payment;
import com.backend.benxere.entity.Schedule;
import com.backend.benxere.entity.Seat;
import com.backend.benxere.entity.enums.PaymentMethod;
import com.backend.benxere.repository.PaymentRepository;
import com.backend.benxere.service.LocationService;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BookingEmailHelper {
    
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm 'ngày' dd/MM/yyyy");
    private static final Locale VIETNAM_LOCALE = new Locale("vi", "VN");
    
    private final PaymentRepository paymentRepository;
    private final LocationService locationService;
    
    public BookingEmailHelper(PaymentRepository paymentRepository, LocationService locationService) {
        this.paymentRepository = paymentRepository;
        this.locationService = locationService;
    }
    

    public String generateBookingDetailsHtml(Booking booking, Seat firstSeat) {
        Schedule schedule = booking.getSchedule();
        List<Seat> seats = booking.getSeats();
        
        NumberFormat currencyFormatter = NumberFormat.getCurrencyInstance(VIETNAM_LOCALE);
        
        StringBuilder html = new StringBuilder();
        String originName = schedule.getRoute().getOrigin();
        String destinationName = schedule.getRoute().getDestination();
        
        try {
            originName = locationService.getProvinceByCode(schedule.getRoute().getOrigin()).getName();
            destinationName = locationService.getProvinceByCode(schedule.getRoute().getDestination()).getName();
        } catch (IOException e) {
        }
        html.append("<table class=\"details-table\">");
        
        html.append("<tr><th colspan=\"2\" style=\"background-color:#3f51b5; color:white;\">THÔNG TIN ĐẶT VÉ</th></tr>");
        html.append("<tr><th>Mã đặt vé:</th><td><strong>").append(booking.getBookingId()).append("</strong></td></tr>");
        html.append("<tr><th>Trạng thái:</th><td><span style=\"color:green; font-weight:bold;\">ĐÃ XÁC NHẬN</span></td></tr>");
        html.append("<tr><th>Ngày đặt vé:</th><td>").append(booking.getBookingDate().toLocalDateTime().format(DATE_TIME_FORMATTER)).append("</td></tr>");
        
        html.append("<tr><th colspan=\"2\" style=\"background-color:#3f51b5; color:white;\">THÔNG TIN CHUYẾN XE</th></tr>");
        html.append("<tr><th>Tuyến đường:</th><td><strong>")
              .append(originName)
              .append(" → ")
              .append(destinationName)
              .append("</strong></td></tr>");
        html.append("<tr><th>Nhà xe:</th><td>").append(schedule.getBus().getCompanyName()).append("</td></tr>");
        html.append("<tr><th>Biển số xe:</th><td>").append(schedule.getBus().getBusNumber()).append("</td></tr>");
        html.append("<tr><th>Loại xe:</th><td>").append(schedule.getBus().getBusType()).append("</td></tr>");
        html.append("<tr><th>Thời gian khởi hành:</th><td><strong>").append(schedule.getDepartureTime().format(DATE_TIME_FORMATTER)).append("</strong></td></tr>");
        html.append("<tr><th>Thời gian đến (dự kiến):</th><td>").append(schedule.getArrivalTime().format(DATE_TIME_FORMATTER)).append("</td></tr>");
        html.append("<tr><th>Điểm đón:</th><td>").append(booking.getPickUpLocation().getName()).append("</td></tr>");
        html.append("<tr><th>Điểm trả:</th><td>").append(booking.getDropOffLocation().getName()).append("</td></tr>");
        
        html.append("<tr><th colspan=\"2\" style=\"background-color:#3f51b5; color:white;\">THÔNG TIN GHẾ</th></tr>");
        html.append("<tr><th>Số lượng ghế:</th><td>").append(seats.size()).append("</td></tr>");
        html.append("<tr><th>Số ghế:</th><td>").append(
            seats.stream()
                .map(Seat::getSeatNumber)
                .collect(Collectors.joining(", "))
        ).append("</td></tr>");
        
        html.append("<tr><th colspan=\"2\" style=\"background-color:#3f51b5; color:white;\">THÔNG TIN THANH TOÁN</th></tr>");
        html.append("<tr><th>Giá vé:</th><td>").append(currencyFormatter.format(booking.getOriginalPrice())).append("</td></tr>");
        
        if (booking.getDiscountAmount() != null && booking.getDiscountAmount() > 0) {
            html.append("<tr><th>Giảm giá:</th><td>").append(currencyFormatter.format(booking.getDiscountAmount())).append("</td></tr>");
        }
        
        html.append("<tr><th>Tổng thanh toán:</th><td><strong>").append(currencyFormatter.format(booking.getTotalPrice())).append("</strong></td></tr>");
        html.append("<tr><th>Phương thức thanh toán:</th><td>").append(getPaymentMethodInVietnamese(booking)).append("</td></tr>");
        
        html.append("</table>");
        
        if (seats.size() > 1) {
            html.append("<p style=\"font-style: italic; color: #d32f2f;\">* Lưu ý: Email này chỉ hiển thị một mã QR cho ghế đầu tiên. ");
            html.append("Quý khách có thể xem tất cả các mã QR cho từng ghế trong phần \"Đơn hàng của tôi\" trên ứng dụng hoặc website BenXeSo.</p>");
        }
        
        return html.toString();
    }

    private String getPaymentMethodInVietnamese(Booking booking) {
        Optional<Payment> payment = paymentRepository.findByRelatedEntityId(booking.getBookingId());
        
        if (payment.isEmpty()) {
            return "Chưa thanh toán";
        }
        
        PaymentMethod method = payment.get().getPaymentMethod();
        if (method == null) {
            return "Chưa thanh toán";
        }
        
        switch (method) {
            case CASH:
                return "Tiền mặt";
            case MOMO:
                return "Ví điện tử MoMo";
            case VNPAY:
                return "VNPay";
            case ZALOPAY:
                return "ZaloPay";
            default:
                return "Khác";
        }
    }
}