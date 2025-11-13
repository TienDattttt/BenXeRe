import * as Yup from "yup";

export const validationSchema = Yup.object().shape({
  from: Yup.string().required("Required"),
  to: Yup.string().required("Required"),
  date: Yup.string().required("Required"),
  returnDate: Yup.string(),
  service: Yup.string().required("Required"),
});

export const popularRoutes = [
  { 
    name: "Sài Gòn - Đắk Lắk", 
    price: "259.000đ", 
    oldPrice: "300.000đ", 
    image: "/bxs-daklak.webp",
    description: "Trải nghiệm hành trình dài cùng gia đình",
    duration: "8 giờ",
    amenities: ["WiFi", "Nước uống", "Điều hòa"]
  },
  { 
    name: "Hà Nội - Hải Phòng", 
    price: "100.000đ", 
    oldPrice: "130.000đ", 
    image: "/bxs-hnoi.webp",
    description: "Khám phá thành phố cảng sôi động",
    duration: "2.5 giờ",
    amenities: ["WiFi", "Nước uống", "USB"]
  },
  { 
    name: "Sài Gòn - Đà Lạt", 
    price: "200.000đ", 
    image: "/bxs-dalat.webp",
    description: "Tận hưởng không khí mát mẻ vùng cao",
    duration: "7 giờ",
    amenities: ["WiFi", "Chăn ấm", "Điều hòa"]
  },
  { 
    name: "Đắk Lắk - Đà Nẵng", 
    price: "280.000đ", 
    image: "bxr-songhan.webp",
    description: "Khám phá thành phố biển xinh đẹp",
    duration: "12 giờ",
    amenities: ["WiFi", "Nước uống", "Gối"]
  },
];

export const serviceHighlights = [
  {
    icon: "🚌",
    title: "Xe chất lượng cao",
    description: "Đội xe hiện đại, tiện nghi đầy đủ"
  },
  {
    icon: "⭐",
    title: "Dịch vụ 5 sao",
    description: "Phục vụ chuyên nghiệp, tận tâm"
  },
  {
    icon: "🎫",
    title: "Đặt vé dễ dàng",
    description: "Thanh toán nhanh chóng, an toàn"
  },
  {
    icon: "🔒",
    title: "An toàn tối đa",
    description: "Tài xế giàu kinh nghiệm, có bằng cấp"
  }
];

export const testimonials = [
  {
    name: "Nguyễn Văn Hùng",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    comment: "Dịch vụ tuyệt vời, xe rất sạch sẽ và thoải mái",
    rating: 5
  },
  {
    name: "Trần Thị Mai",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    comment: "Nhân viên phục vụ rất chu đáo và thân thiện",
    rating: 5
  },
  {
    name: "Lê Minh Tuấn",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    comment: "Giá cả hợp lý, chất lượng dịch vụ tốt",
    rating: 4
  }
];

export const statistics = [
  { number: "1M+", label: "Hành khách" },
  { number: "50+", label: "Tuyến đường" },
  { number: "100+", label: "Xe chất lượng cao" },
  { number: "98%", label: "Khách hàng hài lòng" }
];