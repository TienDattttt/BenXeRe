import React from 'react';
import { Navigate } from 'react-router-dom';
import BusOwnerDashboard from '../pages/bus-owner/BusOwnerDashboard';
import BusManagement from '../pages/bus-owner/BusManagement';
import EmployeeManagement from '../pages/bus-owner/EmployeeManagement';
import ScheduleManagement from '../pages/bus-owner/ScheduleManagement';
import StatisticsPage from '../pages/bus-owner/StatisticsPage';
import { Bus, Users, Calendar, BarChart2 } from 'lucide-react';

const busOwnerRoutes = [
  {
    path: '/bus-owner',
    element: <Navigate to="/bus-owner/dashboard" replace />,
  },
  {
    path: '/bus-owner/dashboard',
    element: <BusOwnerDashboard />,
    name: 'Dashboard',
    icon: <Bus />,
  },
  {
    path: '/bus-owner/buses',
    element: <BusManagement />,
    name: 'Quản lý xe',
    icon: <Bus />,
  },
  {
    path: '/bus-owner/employees',
    element: <EmployeeManagement />,
    name: 'Quản lý nhân viên',
    icon: <Users />,
  },
  {
    path: '/bus-owner/schedules',
    element: <ScheduleManagement />,
    name: 'Quản lý lịch trình',
    icon: <Calendar />,
  },
  {
    path: '/bus-owner/statistics',
    element: <StatisticsPage />,
    name: 'Thống kê',
    icon: <BarChart2 />,
  },
];

export default busOwnerRoutes; 