import React from 'react';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home'; // Example icon
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus'; // Example icon
import ScheduleIcon from '@mui/icons-material/Schedule'; // Example icon
import BookIcon from '@mui/icons-material/Book'; // Example icon

const Sidebar = () => {
  return (
    <div className="w-20 hover:w-64 h-full bg-gray-800 text-white flex flex-col transition-all duration-300">
      <div className="p-4 text-2xl font-bold">Bus Seller</div>
      <nav className="flex flex-col p-4">
        <Link to="/bus-seller/dashboard" className="flex items-center py-2 px-4 hover:bg-gray-700 rounded">
          <HomeIcon className="mr-2" />
          <span className="sidebar-text">Dashboard</span>
        </Link>
        <Link to="/bus-seller/manage-buses" className="flex items-center py-2 px-4 hover:bg-gray-700 rounded">
          <DirectionsBusIcon className="mr-2" />
          <span className="sidebar-text">Manage Buses</span>
        </Link>
        <Link to="/bus-seller/manage-schedules" className="flex items-center py-2 px-4 hover:bg-gray-700 rounded">
          <ScheduleIcon className="mr-2" />
          <span className="sidebar-text">Manage Schedules</span>
        </Link>
        <Link to="/bus-seller/manage-bookings" className="flex items-center py-2 px-4 hover:bg-gray-700 rounded">
          <BookIcon className="mr-2" />
          <span className="sidebar-text">Manage Bookings</span>
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;