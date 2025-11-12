package com.backend.benxere.service;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username:benxeso.noreply@gmail.com}")
    private String fromEmail;

    public void sendOtpEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Password Reset OTP");
        message.setText("Your OTP for password reset is: " + otp + "\n" +
                       "This OTP will expire in 5 minutes.\n" +
                       "If you did not request this password reset, please ignore this email.");

        mailSender.send(message);
    }
    
    /**
     * Send a booking confirmation email with QR code
     * @param to Email recipient
     * @param userName User's full name
     * @param bookingDetails HTML content with booking details
     * @param qrCodeBase64 Base64-encoded QR code image
     */    public void sendBookingConfirmationEmail(String to, String userName, String bookingDetails, String qrCodeBase64) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("XÁC NHẬN ĐẶT VÉ XE THÀNH CÔNG - BENXESO");
            
            // Clean base64 string if it has data URI prefix
            String cleanBase64 = qrCodeBase64;
            if (qrCodeBase64.startsWith("data:image/png;base64,")) {
                cleanBase64 = qrCodeBase64.substring("data:image/png;base64,".length());
            }
            
            // Create email content with cid reference for QR code
            String emailContent = createBookingConfirmationEmailTemplate(userName, bookingDetails, "cid:qrcode");
            helper.setText(emailContent, true);
            
            // Add QR code as inline attachment
            byte[] qrCodeBytes = java.util.Base64.getDecoder().decode(cleanBase64);
            helper.addInline("qrcode", new ByteArrayResource(qrCodeBytes), "image/png");
            
            mailSender.send(message);
            log.info("Booking confirmation email sent successfully to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send booking confirmation email to {}: {}", to, e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error sending booking confirmation email to {}: {}", to, e.getMessage());
        }
    }
    
    /**
     * Create HTML email template for booking confirmation
     */
    private String createBookingConfirmationEmailTemplate(String userName, String bookingDetails, String qrCodeBase64) {
        return "<!DOCTYPE html>\n" +
               "<html>\n" +
               "<head>\n" +
               "    <meta charset=\"UTF-8\">\n" +
               "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
               "    <title>Xác Nhận Đặt Vé</title>\n" +
               "    <style>\n" +
               "        body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #333; }\n" +
               "        .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n" +
               "        .header { background-color: #1a73e8; color: white; padding: 20px; text-align: center; }\n" +
               "        .content { padding: 20px; }\n" +
               "        .footer { background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; }\n" +
               "        .qr-code { text-align: center; margin: 20px 0; }\n" +
               "        .qr-code img { width: 200px; height: 200px; }\n" +
               "        .important-note { background-color: #fff8e1; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }\n" +
               "        .details-table { width: 100%; border-collapse: collapse; margin: 15px 0; }\n" +
               "        .details-table th, .details-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }\n" +
               "        .details-table th { background-color: #f2f2f2; }\n" +
               "    </style>\n" +
               "</head>\n" +
               "<body>\n" +
               "    <div class=\"container\">\n" +
               "        <div class=\"header\">\n" +
               "            <h1>XÁC NHẬN ĐẶT VÉ THÀNH CÔNG</h1>\n" +
               "        </div>\n" +
               "        <div class=\"content\">\n" +
               "            <p>Kính gửi Quý khách <strong>" + userName + "</strong>,</p>\n" +
               "            <p>Chúng tôi xin trân trọng thông báo rằng đơn đặt vé của Quý khách đã được xác nhận thành công. Dưới đây là thông tin chi tiết về chuyến đi của Quý khách:</p>\n" +
               "            \n" + bookingDetails + "\n" +
               "            \n" +
               "            <div class=\"qr-code\">\n" +
               "                <h3>MÃ QR CHECK-IN</h3>\n" +
               "                <p>Vui lòng xuất trình mã QR dưới đây khi lên xe</p>\n" +
               "                <img src=\"" + qrCodeBase64 + "\" alt=\"QR Code Check-in\">\n" +
               "            </div>\n" +
               "            \n" +
               "            <div class=\"important-note\">\n" +
               "                <p><strong>Lưu ý quan trọng:</strong></p>\n" +
               "                <ul>\n" +
               "                    <li>Quý khách vui lòng có mặt tại bến xe trước giờ khởi hành ít nhất 30 phút.</li>\n" +
               "                    <li>Hành lý xách tay không quá 10kg và kích thước phù hợp quy định.</li>\n" +
               "                    <li>Mã QR được sử dụng để check-in khi lên xe và check-out khi xuống xe.</li>\n" +
               "                    <li>Vui lòng giữ email này cho đến khi hoàn thành chuyến đi.</li>\n" +
               "                </ul>\n" +
               "            </div>\n" +
               "            \n" +
               "            <p>Nếu Quý khách có bất kỳ thắc mắc hoặc yêu cầu đặc biệt nào, vui lòng liên hệ với chúng tôi qua số điện thoại <strong>1900 1234</strong> hoặc email <strong>hotro@benxeso.com</strong>.</p>\n" +
               "            \n" +
               "            <p>Trân trọng cảm ơn Quý khách đã sử dụng dịch vụ của BenXeSo.</p>\n" +
               "            \n" +
               "            <p>Kính chúc Quý khách có chuyến đi an toàn và thoải mái!</p>\n" +
               "        </div>\n" +
               "        <div class=\"footer\">\n" +
               "            <p>© 2025 BenXeSo - Nền tảng đặt vé xe trực tuyến hàng đầu Việt Nam</p>\n" +
               "            <p>Địa chỉ: 54 Nguyễn Lương Bằng, Phường Hòa Khánh Bắc, Quận Liên Chiểu, Thành phố Đà Nẵng</p>\n" +
               "            <p>Hotline: 1900 1234 | Email: hotro@benxeso.com | Website: www.benxeso.com</p>\n" +
               "        </div>\n" +
               "    </div>\n" +
               "</body>\n" +
               "</html>";
    }
}