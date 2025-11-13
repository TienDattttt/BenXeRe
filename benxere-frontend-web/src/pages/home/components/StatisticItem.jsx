import React from 'react';
import { motion } from "framer-motion";

const StatisticItem = ({ stat, index }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: {
          delay: index * 0.1,
          duration: 0.5
        }
      }
    }}
    className="text-center"
  >
    <motion.span 
      className="text-4xl font-bold block text-white mb-2"
      whileHover={{ scale: 1.1 }}
    >
      {stat.number}
    </motion.span>
    <span className="text-white/80">{stat.label}</span>
  </motion.div>
);

export default StatisticItem;