import React from 'react';
import { motion } from "framer-motion";
import Typography from "../../../components/core/typography";

const ErrorMessage = ({ errorMessage }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-3 border border-red-100 shadow-sm"
    >
      <motion.i
        className="fas fa-exclamation-circle text-lg"
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />
      <div>
        <Typography variant="subtitle2" className="font-semibold mb-0.5">
          Lỗi xác thực
        </Typography>
        <Typography variant="body2" className="opacity-90">
          {errorMessage}
        </Typography>
      </div>
    </motion.div>
  );
};

export default ErrorMessage;