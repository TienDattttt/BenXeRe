import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Calendar,
  Users,
  Settings,
  LogOut,
  Home,
} from 'lucide-react';

const SidebarLayout = ({ children }) => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/customer-care/schedules',
      icon: <Calendar className="w-5 h-5" />,
      label: 'Quản lý chuyến xe',
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">Customer Care</h1>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t">
          <button
            className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors w-full"
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/auth';
            }}
          >
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default SidebarLayout; 