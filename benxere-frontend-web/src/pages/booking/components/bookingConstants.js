export const mockBookingDetails = {
  contact: {
    name: "",
    phone: "",
    email: "",
  },
  tripInfo: {
    route: "Đà Nẵng to Buôn Ma Thuột",
    departureTime: "18:20, 17/01/2025",
    arrivalTime: "06:40, 18/01/2025",
    operator: "Mai Linh (Đà Nẵng)",
    pickup: "Chợ Miếu Bông, Hòa Vang, Đà Nẵng",
    dropoff: "Bến xe phía Bắc Buôn Ma Thuột",
    price: 300000,
    image: "https://via.placeholder.com/150", // Placeholder image for trip
  },
  addons: [
    {
      name: "Bảo hiểm chuyến đi",
      description: "Được bồi thường lên đến 400.000đ/ghế.",
      price: 20000,
    },
    {
      name: "Bảo hiểm tai nạn",
      description: "Quyền lợi bồi thường đến 40 triệu đồng khi xảy ra tai nạn.",
    },
    {
      name: "Bảo hiểm hủy chuyến",
      description: "Bồi thường 100% tiền vé nếu chuyến đi bị hủy do khách quan hoặc bất khả kháng về sức khỏe.",
    },
  ],
};