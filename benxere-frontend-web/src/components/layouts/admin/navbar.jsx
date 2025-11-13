import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaBell, FaSearch, FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";
import ChatSystem from "../../chat/ChatSystem";

const AdminNavbar = ({ toggleSidebar }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between px-6 h-16">
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar} 
            className="text-gray-500 focus:outline-none focus:text-gray-700 mr-4"
          >
            <FaBars className="h-5 w-5" />
          </button>

          <div className="relative md:w-64">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </span>
            <input 
              className="form-input w-full pl-10 pr-4 py-2 rounded-md text-gray-700 bg-gray-100 border-transparent focus:border-blue-500 focus:bg-white focus:ring-0" 
              type="text" 
              placeholder="Tìm kiếm..." 
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* ChatSystem component */}
          <ChatSystem userRole="ADMIN" />

          {/* User Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <FaUser className="h-4 w-4" />
              </div>
              <span className="hidden md:block font-medium text-gray-700">Admin</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white rounded-md shadow-lg z-20">
                <div className="py-1">
                  <Link 
                    to="/admin/profile" 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <FaUser className="mr-3 h-4 w-4 text-gray-500" />
                    Hồ sơ
                  </Link>
                  <Link 
                    to="/admin/settings" 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <FaCog className="mr-3 h-4 w-4 text-gray-500" />
                    Cài đặt
                  </Link>
                  <hr className="my-1" />
                  <Link 
                    to="/auth" 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <FaSignOutAlt className="mr-3 h-4 w-4 text-gray-500" />
                    Đăng xuất
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;