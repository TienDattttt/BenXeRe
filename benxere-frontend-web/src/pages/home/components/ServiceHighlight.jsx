import React from 'react';
import { motion } from "framer-motion";

const ServiceHighlight = ({ service, index }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: {
          delay: index * 0.2,
          duration: 0.5
        }
      }
    }}
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-xl shadow-lg text-center"
  >
    <span className="text-4xl mb-4 block">{service.icon}</span>
    <h3 className="text-xl font-semibold mb-2 text-gray-800">{service.title}</h3>
    <p className="text-gray-600">{service.description}</p>
  </motion.div>
);

export default ServiceHighlight;