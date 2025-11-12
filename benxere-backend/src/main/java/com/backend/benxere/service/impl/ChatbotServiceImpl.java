package com.backend.benxere.service.impl;

import com.backend.benxere.dto.request.ChatbotRequest;
import com.backend.benxere.dto.response.ChatbotResponse;
import com.backend.benxere.dto.response.ChatbotBookingDTO;
import com.backend.benxere.dto.response.ChatbotScheduleDTO;
import com.backend.benxere.dto.response.ChatbotCompanyDTO;
import com.backend.benxere.dto.response.ChatbotRatingDTO;
import com.backend.benxere.entity.*;
import com.backend.benxere.repository.*;
import com.backend.benxere.service.ChatbotAIService;
import com.backend.benxere.service.ChatbotService;
import com.backend.benxere.service.LocationCodeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotServiceImpl implements ChatbotService {

    private final ChatbotAIService chatbotAIService;
    private final ScheduleRepository scheduleRepository;
    private final BusRepository busRepository;
    private final BookingRepository bookingRepository;
    private final RatingRepository ratingRepository;
    private final LocationRepository locationRepository;
    private final RouteRepository routeRepository;
    private final UserRepository userRepository;
    private final LocationCodeService locationCodeService;

    @Override
    public ChatbotResponse processRequest(ChatbotRequest request) {
        log.info("Processing chatbot request: {}", request.getText());
        
        try {
            // Call AI service to get intent and entities
            ChatbotResponse aiResponse = chatbotAIService.predictIntent(request.getText());
            
            if (aiResponse == null || aiResponse.getIntent() == null) {
                return createErrorResponse("Không thể xử lý yêu cầu của bạn. Vui lòng thử lại.");
            }
            
            String intent = aiResponse.getIntent();
            Map<String, String> rawEntities = aiResponse.getEntities() != null ? aiResponse.getEntities() : new HashMap<>();
            
            // Process BIO tagged entities to extract complete entities
            Map<String, String> entities = processBIOEntities(rawEntities, request.getText());
            
            // Fallback: extract date if AI didn't detect it
            if (!entities.containsKey("date")) {
                String extractedDate = extractDateFromText(request.getText());
                if (extractedDate != null) {
                    entities.put("date", extractedDate);
                    log.info("Fallback extracted date: {}", extractedDate);
                }
            }
            
            log.info("Detected intent: {}, raw entities: {}, processed entities: {}", intent, rawEntities, entities);
            
            // Process based on intent
            ChatbotResponse response = processIntent(intent, entities, request.getText());
            response.setOriginalText(request.getText());
            
            return response;
            
        } catch (Exception e) {
            log.error("Error processing chatbot request: {}", e.getMessage(), e);
            return createErrorResponse("Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại sau.");
        }
    }

    private ChatbotResponse processIntent(String intent, Map<String, String> entities, String originalText) {
        switch (intent.toLowerCase()) {
            case "chao_hoi":
                return handleGreeting();
            case "tim_lich_trinh":
                return handleScheduleSearch(entities);
            case "thong_tin_nha_xe":
                return handleBusCompanyInfo();
            case "ve_cua_toi":
                // First try to use authenticated user, fallback to email extraction
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.isAuthenticated() && 
                    !"anonymousUser".equals(auth.getPrincipal())) {
                    return handleMyTickets(); // Will use SecurityContext internally
                }
                
                // If not authenticated, check if email is provided in text
                String email = extractEmailFromText(originalText);
                if (email != null) {
                    return handleTicketLookup(email);
                }
                
                return handleMyTickets(); // Will show login instruction
            case "danh_gia_nha_xe":
                return handleBusRatings();
            default:
                return createErrorResponse("Xin lỗi, tôi chưa hiểu ý của bạn. Bạn có thể hỏi về lịch trình, thông tin nhà xe, vé của bạn hoặc đánh giá nhà xe.");
        }
    }

    private ChatbotResponse handleGreeting() {
        String greetingMessage = "Xin chào! Tôi là chatbot hỗ trợ khách hàng của BenXeSo. " +
                "Tôi có thể giúp bạn:\n" +
                "• Tìm lịch trình xe\n" +
                "• Xem thông tin các nhà xe\n" +
                "• Kiểm tra vé của bạn\n" +
                "• Xem đánh giá nhà xe\n\n" +
                "Bạn cần hỗ trợ gì?";
        
        return ChatbotResponse.builder()
                .intent("chao_hoi")
                .message(greetingMessage)
                .build();
    }

    private ChatbotResponse handleScheduleSearch(Map<String, String> entities) {
        try {
            // Extract entities for schedule search
            String departure = entities.get("departure");
            String destination = entities.get("destination");
            String dateStr = entities.get("date");
            String priceRange = entities.get("price_range");
            
            log.info("Schedule search - Departure: {}, Destination: {}, Date: {}, Price: {}", 
                    departure, destination, dateStr, priceRange);
            
            // Convert location names to codes
            final String departureCode = (departure != null && !departure.trim().isEmpty()) 
                ? locationCodeService.getLocationCode(departure) : null;
            final String destinationCode = (destination != null && !destination.trim().isEmpty()) 
                ? locationCodeService.getLocationCode(destination) : null;
            
            if (departureCode != null) {
                log.info("Departure '{}' -> code: {}", departure, departureCode);
            }
            if (destinationCode != null) {
                log.info("Destination '{}' -> code: {}", destination, destinationCode);
            }
            
            // Get all schedules first
            List<Schedule> allSchedules = scheduleRepository.findAll();
            List<Schedule> filteredSchedules = new ArrayList<>(allSchedules);
            
            // Filter by date if provided
            if (dateStr != null && !dateStr.trim().isEmpty()) {
                LocalDate searchDate = parseDate(dateStr);
                if (searchDate != null) {
                    filteredSchedules = filteredSchedules.stream()
                            .filter(schedule -> schedule.getDepartureTime().toLocalDate().equals(searchDate))
                            .collect(Collectors.toList());
                }
            }
            
            // Filter by departure location if provided
            if (departureCode != null) {
                filteredSchedules = filteredSchedules.stream()
                        .filter(schedule -> containsLocationCode(schedule, departureCode, true))
                        .collect(Collectors.toList());
            }
            
            // Filter by destination location if provided
            if (destinationCode != null) {
                filteredSchedules = filteredSchedules.stream()
                        .filter(schedule -> containsLocationCode(schedule, destinationCode, false))
                        .collect(Collectors.toList());
            }
            
            // Filter by price range if provided
            if (priceRange != null && !priceRange.trim().isEmpty()) {
                double[] priceRangeValues = parsePriceRange(priceRange);
                if (priceRangeValues != null) {
                    double minPrice = priceRangeValues[0];
                    double maxPrice = priceRangeValues[1];
                    filteredSchedules = filteredSchedules.stream()
                            .filter(schedule -> schedule.getPricePerSeat() >= minPrice && 
                                              schedule.getPricePerSeat() <= maxPrice)
                            .collect(Collectors.toList());
                }
            }
            
            return createScheduleResponse(filteredSchedules, entities);
            
        } catch (Exception e) {
            log.error("Error in schedule search: {}", e.getMessage(), e);
            return createErrorResponse("Không thể tìm kiếm lịch trình. Vui lòng thử lại.");
        }
    }

    private ChatbotResponse handleBusCompanyInfo() {
        try {
            List<Bus> allBuses = busRepository.findAllWithImages();
            
            // Group buses by company
            Map<String, List<Bus>> busesGroupedByCompany = allBuses.stream()
                    .collect(Collectors.groupingBy(Bus::getCompanyName));
            
            StringBuilder message = new StringBuilder("📋 **THÔNG TIN CÁC NHÀ XE**\n\n");
            
            List<ChatbotCompanyDTO> companyData = new ArrayList<>();
            
            busesGroupedByCompany.forEach((companyName, buses) -> {
                // Get average rating for company
                double avgRating = 0.0;
                long ratingCount = 0;
                if (ratingRepository.existsByScheduleBusCompanyName(companyName)) {
                    avgRating = ratingRepository.getAverageRatingByCompanyName(companyName);
                    ratingCount = ratingRepository.countByScheduleBusCompanyName(companyName);
                }
                
                // Get bus types
                Set<String> busTypes = buses.stream()
                        .map(bus -> bus.getBusType().name())
                        .collect(Collectors.toSet());
                
                ChatbotCompanyDTO companyDTO = ChatbotCompanyDTO.builder()
                        .companyName(companyName)
                        .busCount(buses.size())
                        .averageRating(Math.round(avgRating * 10.0) / 10.0)
                        .ratingCount(ratingCount)
                        .busTypes(busTypes)
                        .build();
                
                companyData.add(companyDTO);
                
                message.append("🚌 **").append(companyName).append("**\n")
                       .append("• Số xe: ").append(buses.size()).append("\n")
                       .append("• Đánh giá: ").append(String.format("%.1f", avgRating))
                       .append("/5 (").append(ratingCount).append(" đánh giá)\n")
                       .append("• Loại xe: ").append(String.join(", ", busTypes)).append("\n\n");
            });
            
            return ChatbotResponse.builder()
                    .intent("thong_tin_nha_xe")
                    .message(message.toString())
                    .data(companyData)
                    .build();
            
        } catch (Exception e) {
            log.error("Error getting bus company info: {}", e.getMessage(), e);
            return createErrorResponse("Không thể lấy thông tin nhà xe. Vui lòng thử lại.");
        }
    }

    private ChatbotResponse handleMyTickets() {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated() || 
                "anonymousUser".equals(authentication.getPrincipal())) {
                
                String message = "🎫 **VÉ CỦA BẠN**\n\n" +
                        "Để xem thông tin vé của bạn, vui lòng:\n" +
                        "1. Đăng nhập vào tài khoản\n" +
                        "2. Hoặc cung cấp email đã đặt vé để tôi tra cứu\n\n" +
                        "Bạn có thể nhập: 'Kiểm tra vé email [email của bạn]'";
                
                return ChatbotResponse.builder()
                        .intent("ve_cua_toi")
                        .message(message)
                        .build();
            }
            
            // User is authenticated, get their email and lookup tickets
            String currentUserEmail = authentication.getName();
            log.info("Looking up tickets for authenticated user: {}", currentUserEmail);
            
            return handleTicketLookup(currentUserEmail);
            
        } catch (Exception e) {
            log.error("Error in handleMyTickets: {}", e.getMessage(), e);
            return createErrorResponse("Không thể truy cập thông tin vé. Vui lòng thử lại.");
        }
    }

    private ChatbotResponse handleTicketLookup(String email) {
        try {
            List<Booking> userBookings = bookingRepository.getBookingsByUserEmail(email);
            
            if (userBookings.isEmpty()) {
                return ChatbotResponse.builder()
                        .intent("ve_cua_toi")
                        .message("❌ Không tìm thấy vé nào với email: " + email + "\n\n" +
                                "Vui lòng kiểm tra lại email hoặc liên hệ hỗ trợ khách hàng.")
                        .build();
            }
            
            // Group bookings by status
            Map<Booking.BookingStatus, List<Booking>> bookingsByStatus = userBookings.stream()
                    .collect(Collectors.groupingBy(Booking::getStatus));
            
            // Try to get user info for better display
            String displayName = email;
            try {
                User user = userRepository.findByEmail(email).orElse(null);
                if (user != null) {
                    String fullName = "";
                    if (user.getFirstName() != null && !user.getFirstName().trim().isEmpty()) {
                        fullName += user.getFirstName();
                    }
                    if (user.getLastName() != null && !user.getLastName().trim().isEmpty()) {
                        if (!fullName.isEmpty()) fullName += " ";
                        fullName += user.getLastName();
                    }
                    if (!fullName.trim().isEmpty()) {
                        displayName = fullName + " (" + email + ")";
                    }
                }
            } catch (Exception e) {
                log.warn("Could not get user info for email: {}", email);
            }
            
            StringBuilder message = new StringBuilder("🎫 **VÉ CỦA BẠN** - ").append(displayName).append("\n\n");
            
            // Show confirmed bookings first
            if (bookingsByStatus.containsKey(Booking.BookingStatus.Confirmed)) {
                List<Booking> confirmedBookings = bookingsByStatus.get(Booking.BookingStatus.Confirmed);
                message.append("✅ **VÉ ĐÃ XÁC NHẬN** (").append(confirmedBookings.size()).append(")\n\n");
                
                for (int i = 0; i < Math.min(3, confirmedBookings.size()); i++) {
                    Booking booking = confirmedBookings.get(i);
                    appendBookingInfo(message, booking, i + 1);
                }
                
                if (confirmedBookings.size() > 3) {
                    message.append("... và ").append(confirmedBookings.size() - 3).append(" vé khác\n\n");
                }
            }
            
            // Show pending bookings
            if (bookingsByStatus.containsKey(Booking.BookingStatus.Pending)) {
                List<Booking> pendingBookings = bookingsByStatus.get(Booking.BookingStatus.Pending);
                message.append("⏳ **VÉ CHỜ XÁC NHẬN** (").append(pendingBookings.size()).append(")\n\n");
                
                for (int i = 0; i < Math.min(2, pendingBookings.size()); i++) {
                    Booking booking = pendingBookings.get(i);
                    appendBookingInfo(message, booking, i + 1);
                }
            }
            
            // Show cancelled bookings (if any)
            if (bookingsByStatus.containsKey(Booking.BookingStatus.Cancelled)) {
                List<Booking> cancelledBookings = bookingsByStatus.get(Booking.BookingStatus.Cancelled);
                message.append("❌ **VÉ ĐÃ HỦY** (").append(cancelledBookings.size()).append(")\n");
                message.append("Liên hệ hỗ trợ để biết thêm chi tiết.\n\n");
            }
            
            message.append("💡 Để xem chi tiết hoặc in vé, vui lòng truy cập ứng dụng/website.");
            
            // Convert bookings to DTOs to avoid circular reference
            List<ChatbotBookingDTO> bookingDTOs = userBookings.stream()
                    .map(ChatbotBookingDTO::fromBooking)
                    .collect(Collectors.toList());
            
            return ChatbotResponse.builder()
                    .intent("ve_cua_toi")
                    .message(message.toString())
                    .data(bookingDTOs)
                    .build();
            
        } catch (Exception e) {
            log.error("Error looking up tickets for email {}: {}", email, e.getMessage(), e);
            return createErrorResponse("Không thể tra cứu vé. Vui lòng thử lại sau.");
        }
    }

    private void appendBookingInfo(StringBuilder message, Booking booking, int index) {
        message.append("**").append(index).append(". ");
        if (booking.getSchedule() != null && booking.getSchedule().getRoute() != null) {
            message.append(booking.getSchedule().getRoute().getOrigin() + " - " + 
                          booking.getSchedule().getRoute().getDestination());
        } else {
            message.append("Lịch trình");
        }
        message.append("**\n");
        
        if (booking.getSchedule() != null) {
            message.append("🕐 Khởi hành: ")
                   .append(booking.getSchedule().getDepartureTime().format(DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy")))
                   .append("\n");
            
            if (booking.getSchedule().getBus() != null) {
                message.append("🚌 Nhà xe: ").append(booking.getSchedule().getBus().getCompanyName()).append("\n");
            }
        }
        
        message.append("💰 Tổng tiền: ").append(String.format("%,.0f", booking.getTotalPrice())).append(" VND\n");
        
        if (booking.getSeats() != null && !booking.getSeats().isEmpty()) {
            message.append("💺 Ghế: ");
            booking.getSeats().forEach(seat -> message.append(seat.getSeatNumber()).append(" "));
            message.append("\n");
        }
        
        message.append("📅 Đặt lúc: ")
               .append(booking.getBookingDate().toLocalDateTime().format(DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy")))
               .append("\n\n");
    }

    private ChatbotResponse handleBusRatings() {
        try {
            // Get top rated companies
            Set<String> companyNames = ratingRepository.findAllUniqueCompanyNames();
            
            List<ChatbotRatingDTO> topRatedCompanies = new ArrayList<>();
            
            for (String companyName : companyNames) {
                if (ratingRepository.existsByScheduleBusCompanyName(companyName)) {
                    double avgRating = ratingRepository.getAverageRatingByCompanyName(companyName);
                    long ratingCount = ratingRepository.countByScheduleBusCompanyName(companyName);
                    
                    ChatbotRatingDTO ratingDTO = ChatbotRatingDTO.builder()
                            .companyName(companyName)
                            .averageRating(Math.round(avgRating * 10.0) / 10.0)
                            .ratingCount(ratingCount)
                            .build();
                    
                    topRatedCompanies.add(ratingDTO);
                }
            }
            
            // Sort by average rating descending
            topRatedCompanies.sort((a, b) -> 
                Double.compare(b.getAverageRating(), a.getAverageRating()));
            
            StringBuilder message = new StringBuilder("⭐ **ĐÁNH GIÁ NHÀ XE**\n\n");
            
            if (topRatedCompanies.isEmpty()) {
                message.append("Chưa có đánh giá nào từ khách hàng.");
            } else {
                message.append("**Top nhà xe được đánh giá cao:**\n\n");
                
                for (int i = 0; i < Math.min(5, topRatedCompanies.size()); i++) {
                    ChatbotRatingDTO company = topRatedCompanies.get(i);
                    message.append(i + 1).append(". **").append(company.getCompanyName()).append("**\n")
                           .append("   ⭐ ").append(company.getAverageRating()).append("/5")
                           .append(" (").append(company.getRatingCount()).append(" đánh giá)\n\n");
                }
            }
            
            return ChatbotResponse.builder()
                    .intent("danh_gia_nha_xe")
                    .message(message.toString())
                    .data(topRatedCompanies)
                    .build();
            
        } catch (Exception e) {
            log.error("Error getting bus ratings: {}", e.getMessage(), e);
            return createErrorResponse("Không thể lấy thông tin đánh giá. Vui lòng thử lại.");
        }
    }

    // Helper methods
    private boolean containsLocationCode(Schedule schedule, String locationCode, boolean isDeparture) {
        try {
            if (schedule.getRoute() == null) return false;
            
            String routeOriginCode = schedule.getRoute().getOrigin();
            String routeDestinationCode = schedule.getRoute().getDestination();
            
            log.debug("Checking location code: '{}' in route: '{}' -> '{}', isDeparture: {}", 
                     locationCode, routeOriginCode, routeDestinationCode, isDeparture);
            
            if (isDeparture) {
                return locationCode.equals(routeOriginCode);
            } else {
                return locationCode.equals(routeDestinationCode);
            }
            
        } catch (Exception e) {
            log.error("Error checking location code: {}", e.getMessage());
            return false;
        }
    }
    
    private boolean containsLocation(Schedule schedule, String locationName, boolean isDeparture) {
        try {
            if (schedule.getRoute() == null) return false;
            
            String routeName = (schedule.getRoute().getOrigin() + " - " + schedule.getRoute().getDestination()).toLowerCase();
            String searchLocation = locationName.toLowerCase().trim();
            
            log.debug("Checking location: '{}' in route: '{}', isDeparture: {}", searchLocation, routeName, isDeparture);
            
            // Normalize location names for better matching
            String normalizedSearch = normalizeLocationName(searchLocation);
            String normalizedRoute = normalizeLocationName(routeName);
            
            // Check if location name is contained in route name
            if (normalizedRoute.contains(normalizedSearch)) {
                // For departure, check if it's at the beginning
                // For destination, check if it's at the end
                String[] routeParts = normalizedRoute.split("-");
                if (routeParts.length >= 2) {
                    if (isDeparture) {
                        boolean matches = routeParts[0].trim().contains(normalizedSearch);
                        log.debug("Departure check: '{}' in '{}' = {}", normalizedSearch, routeParts[0].trim(), matches);
                        return matches;
                    } else {
                        boolean matches = routeParts[routeParts.length - 1].trim().contains(normalizedSearch);
                        log.debug("Destination check: '{}' in '{}' = {}", normalizedSearch, routeParts[routeParts.length - 1].trim(), matches);
                        return matches;
                    }
                }
                return true;
            }
            
            return false;
        } catch (Exception e) {
            log.error("Error checking location: {}", e.getMessage());
            return false;
        }
    }
    
    private String normalizeLocationName(String location) {
        return location.toLowerCase()
                .replace("đà nẵng", "da nang")
                .replace("đắk lắk", "dak lak") 
                .replace("hồ chí minh", "ho chi minh")
                .replace("tp hcm", "ho chi minh")
                .replace("tp.", "")
                .replace("thành phố", "")
                .replace("tỉnh", "")
                .replace("  ", " ")
                .trim();
    }

    private LocalDate parseDate(String dateStr) {
        try {
            dateStr = dateStr.toLowerCase().trim();
            
            // Handle relative dates first
            if (dateStr.contains("hôm nay") || dateStr.contains("hom nay")) {
                return LocalDate.now();
            } else if (dateStr.contains("ngày mai") || dateStr.contains("ngay mai")) {
                return LocalDate.now().plusDays(1);
            } else if (dateStr.contains("mai")) {
                return LocalDate.now().plusDays(1);
            }
            
            // Extract date pattern from text (prioritize dd/MM format)
            String extractedDate = extractDatePattern(dateStr);
            if (extractedDate != null) {
                dateStr = extractedDate;
            }
            
            // Try different date formats (dd/MM first as requested)
            DateTimeFormatter[] formatters = {
                DateTimeFormatter.ofPattern("dd/MM/yyyy"),
                DateTimeFormatter.ofPattern("dd/MM/yy"),
                DateTimeFormatter.ofPattern("dd/MM"),
                DateTimeFormatter.ofPattern("dd-MM-yyyy"), 
                DateTimeFormatter.ofPattern("dd-MM-yy"),
                DateTimeFormatter.ofPattern("dd-MM"),
                DateTimeFormatter.ofPattern("yyyy-MM-dd"),
                DateTimeFormatter.ofPattern("MM/dd/yyyy")
            };
            
            for (DateTimeFormatter formatter : formatters) {
                try {
                    LocalDate parsedDate = LocalDate.parse(dateStr, formatter);
                    
                    // If only day/month provided, assume current year
                    if (!dateStr.contains("20") && !dateStr.contains("19")) {
                        parsedDate = parsedDate.withYear(LocalDate.now().getYear());
                    }
                    
                    return parsedDate;
                } catch (DateTimeParseException ignored) {
                }
            }
            
            // Try to parse Vietnamese date expressions
            LocalDate vietnameseDate = parseVietnameseDate(dateStr);
            if (vietnameseDate != null) {
                return vietnameseDate;
            }
            
        } catch (Exception e) {
            log.error("Error parsing date: {}", e.getMessage());
        }
        return null;
    }

    private String extractDatePattern(String text) {
        // Pattern for dd/MM, dd/MM/yyyy, dd-MM, dd-MM-yyyy
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(
            "\\b(\\d{1,2})[/\\-](\\d{1,2})(?:[/\\-](\\d{2,4}))?\\b"
        );
        java.util.regex.Matcher matcher = pattern.matcher(text);
        
        if (matcher.find()) {
            return matcher.group();
        }
        
        return null;
    }

    private LocalDate parseVietnameseDate(String dateStr) {
        try {
            // Handle "ngày X tháng Y" format
            if (dateStr.contains("ngày") && dateStr.contains("tháng")) {
                java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(
                    "ngày\\s*(\\d{1,2})\\s*tháng\\s*(\\d{1,2})(?:\\s*năm\\s*(\\d{4}))?"
                );
                java.util.regex.Matcher matcher = pattern.matcher(dateStr);
                
                if (matcher.find()) {
                    int day = Integer.parseInt(matcher.group(1));
                    int month = Integer.parseInt(matcher.group(2));
                    String yearStr = matcher.group(3);
                    int year = yearStr != null ? Integer.parseInt(yearStr) : LocalDate.now().getYear();
                    
                    return LocalDate.of(year, month, day);
                }
            }
            
            // Handle "X/Y" format
            if (dateStr.matches("\\d{1,2}/\\d{1,2}")) {
                String[] parts = dateStr.split("/");
                int day = Integer.parseInt(parts[0]);
                int month = Integer.parseInt(parts[1]);
                int year = LocalDate.now().getYear();
                
                return LocalDate.of(year, month, day);
            }
            
        } catch (Exception e) {
            log.debug("Error parsing Vietnamese date: {}", e.getMessage());
        }
        
        return null;
    }

    private double[] parsePriceRange(String priceRange) {
        try {
            priceRange = priceRange.toLowerCase().trim();
            
            // Handle predefined ranges
            if (priceRange.contains("dưới 100") || priceRange.contains("< 100")) {
                return new double[]{0, 100000};
            } else if (priceRange.contains("100") && priceRange.contains("200")) {
                return new double[]{100000, 200000};
            } else if (priceRange.contains("200") && priceRange.contains("300")) {
                return new double[]{200000, 300000};
            } else if (priceRange.contains("trên 300") || priceRange.contains("> 300")) {
                return new double[]{300000, Double.MAX_VALUE};
            }
            
            // Try to extract numbers
            String[] parts = priceRange.split("-");
            if (parts.length == 2) {
                double min = Double.parseDouble(parts[0].replaceAll("[^0-9.]", "")) * 1000;
                double max = Double.parseDouble(parts[1].replaceAll("[^0-9.]", "")) * 1000;
                return new double[]{min, max};
            }
            
        } catch (Exception e) {
            log.error("Error parsing price range: {}", e.getMessage());
        }
        return null;
    }

    private ChatbotResponse createScheduleResponse(List<Schedule> schedules, Map<String, String> entities) {
        StringBuilder message = new StringBuilder();
        
        if (schedules.isEmpty()) {
            message.append("❌ Không tìm thấy lịch trình phù hợp với yêu cầu của bạn.\n\n")
                   .append("Gợi ý:\n")
                   .append("• Thử thay đổi ngày khởi hành\n")
                   .append("• Kiểm tra lại tên điểm đi/đến\n")
                   .append("• Mở rộng khoảng giá tìm kiếm");
        } else {
            message.append("🚌 **TÌM THẤY ").append(schedules.size()).append(" LỊCH TRÌNH**\n\n");
            
            // Sort by departure time
            schedules.sort(Comparator.comparing(Schedule::getDepartureTime));
            
            // Show first 5 results
            for (int i = 0; i < Math.min(5, schedules.size()); i++) {
                Schedule schedule = schedules.get(i);
                message.append("**").append(i + 1).append(". ")
                       .append(schedule.getRoute() != null ? 
                               (schedule.getRoute().getOrigin() + " - " + schedule.getRoute().getDestination()) : "N/A")
                       .append("**\n")
                       .append("🕐 Khởi hành: ").append(schedule.getDepartureTime().format(DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy"))).append("\n")
                       .append("🕐 Đến: ").append(schedule.getArrivalTime().format(DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy"))).append("\n")
                       .append("💰 Giá: ").append(String.format("%,.0f", schedule.getPricePerSeat())).append(" VND\n")
                       .append("🚌 Nhà xe: ").append(schedule.getBus() != null ? schedule.getBus().getCompanyName() : "N/A").append("\n")
                       .append("📍 Trạng thái: ").append(schedule.getStatus()).append("\n\n");
            }
            
            if (schedules.size() > 5) {
                message.append("... và ").append(schedules.size() - 5).append(" lịch trình khác.\n\n");
            }
            
            message.append("💡 Để đặt vé, vui lòng sử dụng ứng dụng hoặc website của chúng tôi.");
        }
        
        // Convert schedules to DTOs to avoid circular reference
        List<ChatbotScheduleDTO> scheduleDTOs = schedules.stream()
                .limit(5)
                .map(ChatbotScheduleDTO::fromSchedule)
                .collect(Collectors.toList());
        
        return ChatbotResponse.builder()
                .intent("tim_lich_trinh")
                .entities(entities)
                .message(message.toString())
                .data(scheduleDTOs)
                .build();
    }

    /**
     * Process BIO (Begin-Inside-Outside) tagged entities to extract complete entities
     * 
     * Example input:
     * Text: "Tìm xe từ Hà Nội đến Thành phố Hồ Chí Minh ngày mai"
     * Raw entities: {"0": "O", "1": "O", "2": "O", "3": "B-departure", "4": "I-departure", 
     *               "5": "O", "6": "B-destination", "7": "I-destination", "8": "I-destination", 
     *               "9": "I-destination", "10": "I-destination", "11": "B-date", "12": "I-date"}
     * 
     * Output: {"departure": "hà nội", "destination": "thành phố hồ chí minh", "date": "ngày mai"}
     */
    private Map<String, String> processBIOEntities(Map<String, String> rawEntities, String originalText) {
        try {
            Map<String, String> processedEntities = new HashMap<>();
            
            if (rawEntities == null || rawEntities.isEmpty()) {
                return processedEntities;
            }
            
            // Get all token indices and sort them
            List<Integer> tokenIndices = new ArrayList<>();
            for (String key : rawEntities.keySet()) {
                if (key.matches("\\d+")) {
                    tokenIndices.add(Integer.parseInt(key));
                }
            }
            tokenIndices.sort(Integer::compareTo);
            
            // Current entity being built
            String currentEntityType = null;
            StringBuilder currentEntityValue = new StringBuilder();
            
            // Process each token with its BIO tag
            for (int i : tokenIndices) {
                String token = rawEntities.get("token_" + i);
                String bioTag = rawEntities.get(String.valueOf(i));
                
                if (token == null) {
                    // Fallback: use original text split
                    String[] tokens = originalText.toLowerCase().trim().split("\\s+");
                    if (i < tokens.length) {
                        token = tokens[i];
                    } else {
                        continue;
                    }
                }
                
                if (bioTag == null || bioTag.equals("O")) {
                    // Outside - finish current entity if exists
                    if (currentEntityType != null) {
                        processedEntities.put(currentEntityType, currentEntityValue.toString().trim());
                        currentEntityType = null;
                        currentEntityValue = new StringBuilder();
                    }
                } else if (bioTag.startsWith("B-")) {
                    // Begin new entity - finish previous if exists
                    if (currentEntityType != null) {
                        processedEntities.put(currentEntityType, currentEntityValue.toString().trim());
                    }
                    // Start new entity
                    currentEntityType = bioTag.substring(2); // Remove "B-" prefix
                    currentEntityValue = new StringBuilder(token);
                } else if (bioTag.startsWith("I-")) {
                    // Inside entity - continue current entity
                    String entityType = bioTag.substring(2); // Remove "I-" prefix
                    if (currentEntityType != null && currentEntityType.equals(entityType)) {
                        currentEntityValue.append(" ").append(token);
                    } else {
                        // Mismatched I- tag, treat as new B- tag
                        if (currentEntityType != null) {
                            processedEntities.put(currentEntityType, currentEntityValue.toString().trim());
                        }
                        currentEntityType = entityType;
                        currentEntityValue = new StringBuilder(token);
                    }
                }
            }
            
            // Finish the last entity if exists
            if (currentEntityType != null) {
                processedEntities.put(currentEntityType, currentEntityValue.toString().trim());
            }
            
            // Fallback: if no BIO processing worked, try to extract entities directly from rawEntities
            if (processedEntities.isEmpty() && !rawEntities.isEmpty()) {
                for (Map.Entry<String, String> entry : rawEntities.entrySet()) {
                    String key = entry.getKey();
                    String value = entry.getValue();
                    
                    // If the key is already a clean entity name (not BIO tagged)
                    if (!key.matches("\\d+") && !value.startsWith("B-") && !value.startsWith("I-") && !value.equals("O")) {
                        processedEntities.put(key, value);
                    }
                }
            }
            
            log.debug("Processed BIO entities: {}", processedEntities);
            return processedEntities;
            
        } catch (Exception e) {
            log.error("Error processing BIO entities: {}", e.getMessage(), e);
            return new HashMap<>();
        }
    }

    private String extractDateFromText(String text) {
        try {
            // Extract date pattern from text using existing method
            String extractedDate = extractDatePattern(text);
            if (extractedDate != null) {
                return extractedDate;
            }
            
            // Try Vietnamese relative dates
            String lowerText = text.toLowerCase();
            if (lowerText.contains("hôm nay") || lowerText.contains("hom nay")) {
                return "hôm nay";
            } else if (lowerText.contains("ngày mai") || lowerText.contains("ngay mai")) {
                return "ngày mai";
            } else if (lowerText.contains("mai")) {
                return "mai";
            }
            
            // Try "vào ngày X" or "ngày X tháng Y" patterns
            java.util.regex.Pattern vietnamesePattern = java.util.regex.Pattern.compile(
                "(?:vào|vao)\\s*(?:ngày|ngay)?\\s*(\\d{1,2})[/\\-](\\d{1,2})(?:[/\\-](\\d{2,4}))?"
            );
            java.util.regex.Matcher matcher = vietnamesePattern.matcher(text);
            if (matcher.find()) {
                return matcher.group(1) + "/" + matcher.group(2) + 
                       (matcher.group(3) != null ? "/" + matcher.group(3) : "");
            }
            
        } catch (Exception e) {
            log.error("Error extracting date from text: {}", e.getMessage());
        }
        return null;
    }

    private String extractEmailFromText(String text) {
        try {
            // Email pattern regex
            String emailPattern = "\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b";
            java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(emailPattern);
            java.util.regex.Matcher matcher = pattern.matcher(text);
            
            if (matcher.find()) {
                return matcher.group();
            }
        } catch (Exception e) {
            log.error("Error extracting email from text: {}", e.getMessage());
        }
        return null;
    }

    private ChatbotResponse createErrorResponse(String message) {
        return ChatbotResponse.builder()
                .intent("error")
                .message(message)
                .build();
    }
    
    /**
     * Example method to demonstrate BIO entity processing
     * This shows how the system handles various BIO tagging scenarios
     */
    private void demonstrateBIOProcessing() {
        // Example 1: Simple location entities
        String text1 = "Tìm xe từ Hà Nội đến TP HCM";
        Map<String, String> entities1 = new HashMap<>();
        entities1.put("0", "O");      // Tìm
        entities1.put("1", "O");      // xe  
        entities1.put("2", "O");      // từ
        entities1.put("3", "B-departure"); // Hà
        entities1.put("4", "I-departure"); // Nội
        entities1.put("5", "O");      // đến
        entities1.put("6", "B-destination"); // TP
        entities1.put("7", "I-destination"); // HCM
        
        Map<String, String> result1 = processBIOEntities(entities1, text1);
        log.info("Example 1 - Input: '{}', Entities: {}", text1, result1);
        // Expected: {departure=hà nội, destination=tp hcm}
        
        // Example 2: Complex entities with date and price
        String text2 = "Tìm chuyến từ Đà Nẵng đi Hà Nội ngày 25 tháng 12 giá dưới 200 nghìn";
        Map<String, String> entities2 = new HashMap<>();
        entities2.put("0", "O");      // Tìm
        entities2.put("1", "O");      // chuyến
        entities2.put("2", "O");      // từ
        entities2.put("3", "B-departure"); // Đà
        entities2.put("4", "I-departure"); // Nẵng
        entities2.put("5", "O");      // đi
        entities2.put("6", "B-destination"); // Hà
        entities2.put("7", "I-destination"); // Nội
        entities2.put("8", "B-date"); // ngày
        entities2.put("9", "I-date"); // 25
        entities2.put("10", "I-date");// tháng
        entities2.put("11", "I-date");// 12
        entities2.put("12", "O");     // giá
        entities2.put("13", "B-price_range"); // dưới
        entities2.put("14", "I-price_range"); // 200
        entities2.put("15", "I-price_range"); // nghìn
        
        Map<String, String> result2 = processBIOEntities(entities2, text2);
        log.info("Example 2 - Input: '{}', Entities: {}", text2, result2);
        // Expected: {departure=đà nẵng, destination=hà nội, date=ngày 25 tháng 12, price_range=dưới 200 nghìn}
    }
}
