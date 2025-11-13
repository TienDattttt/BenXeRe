import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import '../../styles/account-modern-theme.css';

const SidebarNavItem = ({ item, isActive }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={`nav-item group ${isActive ? 'nav-item-active' : ''}`}
      initial={false}
      animate={isActive ? {
        scale: 1.02,
        transition: { type: 'spring', stiffness: 300, damping: 30 }
      } : { scale: 1 }}
      whileHover={!isActive && { scale: 1.01, x: 4 }}
      whileTap={!isActive && { scale: 0.98 }}
    >
      <div className="flex items-center space-x-4 p-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          isActive ? 'bg-white/20' : 'bg-blue-50'
        } transition-all duration-300`}>
          <span className="text-xl">{item.icon}</span>
        </div>
        <div>
          <span className={`font-medium block ${
            isActive ? 'text-white' : 'text-gray-700'
          }`}>
            {item.label}
          </span>
          <span className={`text-sm ${
            isActive ? 'text-blue-100' : 'text-gray-500'
          }`}>
            {item.description}
          </span>
        </div>
      </div>
      {isActive && (
        <motion.div 
          className="active-indicator"
          layoutId="active-nav-indicator"
        />
      )}
    </motion.div>
  );
};

const AccountSidebarLayout = ({ children }) => {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { 
      path: '/account/information',
      label: 'Thông tin cá nhân',
      icon: '👤',
      description: 'Quản lý thông tin cá nhân'
    },
    { 
      path: '/account/orders',
      label: 'Đơn hàng',
      icon: '🎫',
      description: 'Xem lịch sử đặt vé'
    },
    { 
      path: '/account/reviews',
      label: 'Đánh giá',
      icon: '⭐',
      description: 'Chia sẻ trải nghiệm'
    },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="layout-container">
      {/* Mobile Menu Button */}
      <motion.button
        className="lg:hidden fixed top-4 left-4 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-full shadow-lg"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.span
          animate={isMenuOpen ? { rotate: 90 } : { rotate: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isMenuOpen ? '✕' : '☰'}
        </motion.span>
      </motion.button>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <motion.aside
          className={`fixed lg:relative inset-y-0 left-0 z-40 w-80 transform transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } sidebar-container`}
        >
          <div className="h-full flex flex-col">
            {/* Logo Section */}
            <div className="p-6">
              <motion.div 
                className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 relative overflow-hidden"
                whileHover={{ scale: 1.02 }}
              >
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-2xl">🚌</span>
                    </div>
                    <h1 className="text-white text-2xl font-bold">BenXeSo</h1>
                  </div>
                  <p className="text-blue-100 text-sm">Trải nghiệm chuyến đi hoàn hảo</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0" />
              </motion.div>
            </div>

            {/* Navigation */}
            <nav className="px-4 flex-1 custom-scroll overflow-y-auto">
              <div className="space-y-2">
                {navItems.map((item) => (
                  <Link key={item.path} to={item.path}>
                    <SidebarNavItem 
                      item={item}
                      isActive={location.pathname === item.path}
                    />
                  </Link>
                ))}
              </div>
            </nav>

            {/* Logout Button */}
            <div className="p-6">
              <motion.button
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl py-3 px-6 shadow-lg group relative overflow-hidden"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <span>Đăng xuất</span>
                  <motion.span
                    animate={{
                      x: [0, 4, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}
                  >
                    🚪
                  </motion.span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-full group-hover:translate-x-[-180%] transition-transform duration-1000" />
              </motion.button>
            </div>
          </div>
        </motion.aside>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-30 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              className="min-h-screen p-6 lg:p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AccountSidebarLayout;