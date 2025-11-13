import React from 'react';
import { motion } from "framer-motion";

const TestimonialCard = ({ testimonial, index }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, scale: 0.8 },
      visible: { 
        opacity: 1, 
        scale: 1,
        transition: {
          delay: index * 0.2,
          duration: 0.5
        }
      }
    }}
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-xl shadow-lg"
  >
    <div className="flex items-center mb-4">
      <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4" />
      <div>
        <h4 className="font-semibold">{testimonial.name}</h4>
        <div className="flex text-yellow-400">
          {[...Array(testimonial.rating)].map((_, i) => (
            <span key={i}>⭐</span>
          ))}
        </div>
      </div>
    </div>
    <p className="text-gray-600 italic">"{testimonial.comment}"</p>
  </motion.div>
);

export default TestimonialCard;