import React from 'react';
import { motion } from "framer-motion";
import Skeleton from "react-loading-skeleton";

const LoadingCard = ({ index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ 
      opacity: 1, 
      scale: 1,
      transition: {
        delay: index * 0.2,
        duration: 0.5
      }
    }}
    className="h-48 relative overflow-hidden"
  >
    <Skeleton height="100%" />
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
      animate={{
        x: ["-100%", "100%"],
        transition: {
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }
      }}
    />
  </motion.div>
);

export default LoadingCard;