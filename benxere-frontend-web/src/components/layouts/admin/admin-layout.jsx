import React, { useState } from "react";
import AdminSidebar from "./sidebar";
import AdminNavbar from "./navbar";
import { motion } from "framer-motion";

const AdminLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar collapsed={sidebarCollapsed} toggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            <motion.div 
              className="bg-white rounded-lg shadow-md p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
        <footer className="bg-white px-6 py-4 shadow-inner">
          <p className="text-gray-600 text-sm text-center">© 2025 BenXeSo Admin Dashboard. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;