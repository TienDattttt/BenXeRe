import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import Typography from '../../core/typography';
import { Bus, Users, Calendar, BarChart2, Settings, Home, Star } from 'lucide-react';

const menuItems = [
  {
    title: 'Tổng quan',
    items: [
      {
        name: 'Bảng điều khiển',
        path: '/bus-owner/dashboard',
        icon: <Home className="w-5 h-5" />,
      },
      {
        name: 'Thống kê',
        path: '/bus-owner/statistics',
        icon: <BarChart2 className="w-5 h-5" />,
      },
      {
        name: 'Đánh giá',
        path: '/bus-owner/reviews',
        icon: <Star className="w-5 h-5" />,
      },
    ],
  },
  {
    title: 'Quản lý',
    items: [
      {
        name: 'Quản lý xe',
        path: '/bus-owner/buses',
        icon: <Bus className="w-5 h-5" />,
      },
      {
        name: 'Quản lý nhân viên',
        path: '/bus-owner/employees',
        icon: <Users className="w-5 h-5" />,
      },
      {
        name: 'Quản lý lịch trình',
        path: '/bus-owner/schedules',
        icon: <Calendar className="w-5 h-5" />,
      },
    ],
  },
  {
    title: 'Tài khoản',
    items: [
      {
        name: 'Cài đặt',
        path: '/bus-owner/settings',
        icon: <Settings className="w-5 h-5" />,
      },
    ],
  },
];

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const getNavItemClasses = (active) => {
    return twMerge(
      "flex items-center gap-x-3 px-3 py-2 rounded-lg transition-colors",
      active ? "bg-primary-100 text-primary-700" : "text-gray-700 hover:bg-gray-100"
    );
  };

  return (
    <aside className="h-screen sticky top-0 z-40">
      <div className="flex flex-col h-full px-4 py-8 bg-white border-r border-gray-200">
        <div className="flex items-center justify-between mb-8">
          <Typography variant="h5" color="primary" className="font-semibold">
            BenXeSo
          </Typography>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isCollapsed ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              )}
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-8">
          {menuItems.map((section) => (
            <div key={section.title}>
              {!isCollapsed && (
                <Typography
                  variant="overline"
                  color="muted"
                  className="px-3 mb-2"
                >
                  {section.title}
                </Typography>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      className={getNavItemClasses(isActive(item.path))}
                      title={isCollapsed ? item.name : undefined}
                    >
                      {item.icon}
                      {!isCollapsed && (
                        <span className="text-sm font-medium">
                          {item.name}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;