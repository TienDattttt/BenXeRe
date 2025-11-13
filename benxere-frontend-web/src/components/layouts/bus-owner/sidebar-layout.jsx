import React from 'react';
import Sidebar from './sidebar';

const SidebarLayout = ({ children }) => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4 bg-gray-100 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SidebarLayout;