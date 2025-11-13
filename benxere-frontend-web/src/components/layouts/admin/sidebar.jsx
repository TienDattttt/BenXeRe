import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUsers, FaBus, FaRoute, FaCalendarAlt, FaTicketAlt, FaChair, FaTags, FaBolt, FaImage, FaChevronLeft, FaChevronRight, FaHome, FaSignOutAlt, FaComments } from "react-icons/fa";

// More organized menu structure with categories
const menuCategories = [
  {
    title: "Dashboard",
    items: [
      { to: "/admin/dashboard", icon: <FaHome />, label: "Tổng quan" }
    ]
  },
  {
    title: "Quản lý chính",
    items: [
      { to: "/admin/users", icon: <FaUsers />, label: "Người dùng" },
      { to: "/admin/buses", icon: <FaBus />, label: "Quản lý xe" },
      { to: "/admin/routes", icon: <FaRoute />, label: "Tuyến đường" },
      { to: "/admin/schedules", icon: <FaCalendarAlt />, label: "Lịch trình" },
      { to: "/admin/bookings", icon: <FaTicketAlt />, label: "Đặt vé" }
    ]
  },
  {
    title: "Cấu hình",
    items: [
      { to: "/admin/seats", icon: <FaChair />, label: "Sơ đồ ghế" },
      { to: "/admin/coupons", icon: <FaTags />, label: "Mã giảm giá" },
      { to: "/admin/flash-sales", icon: <FaBolt />, label: "Khuyến mãi" },
      { to: "/admin/banners", icon: <FaImage />, label: "Hình ảnh" }
    ]
  },
  {
    title: "Chat",
    items: [
      { to: "/chat", icon: <FaComments />, label: "Chat" }
    ]
  }
];

const AdminSidebar = ({ collapsed, toggleCollapse }) => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState(null);
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <motion.div 
      className={`${collapsed ? 'w-20' : 'w-64'} h-full bg-blue-900 text-white transition-width duration-300 ease-in-out overflow-hidden flex flex-col`}
      initial={false}
    >
      <div className="flex items-center justify-between p-4 border-b border-blue-800">
        {!collapsed && (
          <motion.h2 
            className="text-xl font-bold text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            BenXeRe Admin
          </motion.h2>
        )}
        <button 
          className="p-2 rounded-full hover:bg-blue-800 transition-colors"
          onClick={toggleCollapse}
        >
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        {menuCategories.map((category, idx) => (
          <div key={idx} className="mb-6">
            {!collapsed && (
              <h3 className="px-6 mb-2 text-xs font-semibold text-blue-300 uppercase tracking-wider">
                {category.title}
              </h3>
            )}
            <nav>
              <ul>
                {category.items.map((item, index) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <li key={index}>
                      <Link 
                        to={item.to} 
                        className={`flex items-center px-6 py-3 transition-colors ${
                          isActive 
                            ? 'bg-blue-800 text-white border-l-4 border-blue-400' 
                            : 'text-blue-100 hover:bg-blue-800'
                        }`}
                      >
                        <span className="text-xl">{item.icon}</span>
                        {!collapsed && (
                          <span className="ml-4 font-medium">{item.label}</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-blue-800">
        <Link 
          to="/auth" 
          className="flex items-center px-4 py-2 text-blue-100 hover:bg-blue-800 rounded transition-colors"
        >
          <FaSignOutAlt />
          {!collapsed && <span className="ml-4">Đăng xuất</span>}
        </Link>
      </div>
    </motion.div>
  );
};

export default AdminSidebar;