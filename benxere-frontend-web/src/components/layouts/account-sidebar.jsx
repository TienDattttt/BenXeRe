import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const menuItems = [
  { label: "Thông tin cá nhân", icon: "person", path: "/account/information" },
  { label: "Thành viên BenXeSo", icon: "star", path: "/account/membership" },
  { label: "Vé của tôi", icon: "receipt", path: "/account/orders" },
  { label: "Mã giảm giá", icon: "local_offer", path: "/account/deals" },
  { label: "Phương thức thanh toán", icon: "credit_card", path: "/account/cards" },
  { label: "Đánh giá chuyến đi", icon: "rate_review", path: "/account/reviews" },
  { label: "Lịch sử đặt vé", icon: "history", path: "/account/history" },
  { label: "Đăng xuất", icon: "logout", path: "/logout" },
];

const AccountSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-white w-64 p-5 border-r shadow-sm min-h-screen"
    >
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Tài khoản của tôi
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý thông tin cá nhân
        </p>
      </div>

      <ul className="space-y-1">
        {menuItems.map((item, index) => (
          <motion.li
            key={index}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(item.path)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
              location.pathname === item.path
                ? "bg-primary-50 text-primary-600 font-medium"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="material-icons text-[20px]">{item.icon}</span>
            <span className="text-sm">{item.label}</span>
          </motion.li>
        ))}
      </ul>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Cần hỗ trợ? Liên hệ hotline
        </p>
        <a 
          href="tel:1900000000" 
          className="text-primary-600 font-semibold block mt-1"
        >
          1900 0000 00
        </a>
      </div>
    </motion.aside>
  );
};

export default AccountSidebar;
