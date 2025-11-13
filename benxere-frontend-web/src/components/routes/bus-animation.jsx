import React from 'react';
import { motion } from 'framer-motion';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';

const BusAnimation = () => {
  // Cloud animation variants
  const cloudVariants = {
    animate: {
      x: [0, -1000],
      transition: {
        duration: 20,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  // Bus animation variants
  const busVariants = {
    animate: {
      x: [-100, window.innerWidth + 100],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  // Wheel rotation animation
  const wheelVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  // Road line animation
  const roadLineVariants = {
    animate: {
      x: [0, -1000],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Clouds */}
        <motion.div
          className="absolute top-1/4 left-0 flex gap-20"
          variants={cloudVariants}
          animate="animate"
        >
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-20 h-12 bg-white/20 rounded-full" />
          ))}
        </motion.div>
      </div>

      {/* Road */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gray-800/20">
        {/* Road Lines */}
        <motion.div
          className="absolute top-1/2 left-0 w-full flex gap-12"
          variants={roadLineVariants}
          animate="animate"
        >
          {[...Array(20)].map((_, i) => (
            <div key={i} className="w-16 h-2 bg-white/40 rounded-full" />
          ))}
        </motion.div>
      </div>

      {/* Bus */}
      <motion.div
        className="absolute bottom-16 left-0"
        variants={busVariants}
        animate="animate"
      >
        <div className="relative group">
          {/* Bus Body */}
          <div className="relative w-32 h-16 bg-primary-500 rounded-lg shadow-lg">
            {/* Windows */}
            <div className="absolute top-2 left-4 right-4 h-6 bg-blue-200/80 rounded-sm grid grid-cols-3 gap-1 p-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-blue-100/50 rounded-sm" />
              ))}
            </div>
            {/* Lights */}
            <div className="absolute right-0 top-3 w-2 h-2 bg-yellow-400 rounded-full" />
            <div className="absolute left-0 top-3 w-2 h-2 bg-red-400 rounded-full" />
          </div>

          {/* Wheels */}
          <motion.div
            className="absolute -bottom-2 left-4 w-6 h-6 bg-gray-800 rounded-full"
            variants={wheelVariants}
            animate="animate"
          >
            <div className="absolute inset-2 bg-gray-600 rounded-full" />
          </motion.div>
          <motion.div
            className="absolute -bottom-2 right-4 w-6 h-6 bg-gray-800 rounded-full"
            variants={wheelVariants}
            animate="animate"
          >
            <div className="absolute inset-2 bg-gray-600 rounded-full" />
          </motion.div>

          {/* Bus Icon */}
          <DirectionsBusIcon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white w-8 h-8" />
        </div>

        {/* Motion Trail Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-400/20 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.2, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </motion.div>

      {/* Particle Effects */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, -20],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default BusAnimation;