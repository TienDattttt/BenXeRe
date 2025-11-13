import React from 'react';
import { motion, useScroll, useTransform } from "framer-motion";

const PopularRouteCard = ({ route, index }) => {
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  return (
    <motion.div
      style={{ scale, opacity }}
      variants={{
        hidden: { opacity: 0.1, y: 50 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.8,
            ease: "easeOut",
            delay: index * 0.2,
          },
        },
      }}
      whileHover={{ 
        scale: 1.08,
        y: -10,
        transition: { 
          type: "spring",
          stiffness: 300,
          damping: 15
        }
      }}
      whileTap={{ scale: 0.95 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-2xl"
    >
      <div className="relative h-48 overflow-hidden group">
        <motion.img
          src={route.image}
          alt={route.name}
          className="w-full h-full object-cover transition-transform duration-500"
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.15 }}
          transition={{ duration: 0.5 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <motion.div 
          className="absolute bottom-0 left-0 p-4 text-white w-full"
          initial={{ y: 20, opacity: 0.8 }}
          whileHover={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-xl font-semibold mb-2">{route.name}</h3>
          <p className="text-sm mb-2 opacity-90">{route.description}</p>
          <div className="flex justify-between items-center">
            <div>
              <motion.span 
                className="text-lg font-bold block"
                whileHover={{ scale: 1.1 }}
              >
                {route.price}
              </motion.span>
              {route.oldPrice && (
                <span className="text-sm line-through opacity-75">{route.oldPrice}</span>
              )}
            </div>
            <div className="text-right">
              <span className="text-sm block">⏱️ {route.duration}</span>
              <div className="flex gap-1 mt-1">
                {route.amenities.map((amenity, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-white/20 rounded-full">{amenity}</span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PopularRouteCard;