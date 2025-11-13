import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import Typography from "../../../components/core/typography";
import BusAnimation from "../../../components/auth/bus-animation";
import { backgroundVariants } from './authConstants';

const LeftPanel = ({ activeTab, isLoading }) => {
  return (
    <div className="md:w-2/5 bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 p-8 text-white relative overflow-hidden">
      {/* Animated background pattern */}
      <motion.div
        className="absolute inset-0"
        variants={backgroundVariants}
        initial="initial"
        animate="animate"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 25%),
            radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 25%),
            linear-gradient(45deg, rgba(255, 255, 255, 0.05) 25%, transparent 25%, transparent 75%, rgba(255, 255, 255, 0.05) 75%),
            linear-gradient(-45deg, rgba(255, 255, 255, 0.05) 25%, transparent 25%, transparent 75%, rgba(255, 255, 255, 0.05) 75%)
          `,
          backgroundSize: '100% 100%, 100% 100%, 40px 40px, 40px 40px',
        }}
      />
      <div className="h-full flex flex-col justify-between relative z-10">
        <div className="space-y-4">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h1" className="text-3xl font-bold">
              {activeTab === "login" ? "Chào mừng trở lại!" : "Tham gia cùng BenXeSo"}
            </Typography>
            <Typography variant="body1" className="opacity-90">
              {activeTab === "login" 
                ? "Đăng nhập để tiếp tục hành trình của bạn."
                : "Tạo tài khoản để bắt đầu trải nghiệm."}
            </Typography>
          </motion.div>

          {/* Bus Animation */}
          <div className="mt-8">
            <BusAnimation animate={!isLoading} />
          </div>
        </div>
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black opacity-20" />
    </div>
  );
};

export default LeftPanel;