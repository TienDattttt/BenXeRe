import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import './bus-animation.css';

const BusAnimation = ({ animate = true }) => {
  const [isNight, setIsNight] = useState(false);
  const [currentWeather, setCurrentWeather] = useState(null); // null, 'rain'
  const [sceneTransition, setSceneTransition] = useState(false);
  const weatherCycleRef = useRef(null);
  const controls = useAnimation();
  
  // Smooth day/night cycle
  useEffect(() => {
    if (animate) {
      const dayNightCycle = setInterval(() => {
        setSceneTransition(true);
        setTimeout(() => {
          setIsNight(prev => !prev);
          setSceneTransition(false);
        }, 100);
      }, 20000); // Switch every 20 seconds for a more gentle pace
      
      return () => clearInterval(dayNightCycle);
    }
  }, [animate]);

  // Automatic weather cycle
  useEffect(() => {
    if (animate) {
      weatherCycleRef.current = setInterval(() => {
        setCurrentWeather(prev => {
          // Simple random weather transitions
          if (Math.random() > 0.7) {
            return 'rain';
          }
          return null;
        });
      }, 30000); // Change weather every 30 seconds
      
      return () => clearInterval(weatherCycleRef.current);
    }
  }, [animate]);

  // Create random stars
  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    size: Math.random() * 2 + 1,
    top: Math.random() * 70,
    left: Math.random() * 100,
    blinkDelay: Math.random() * 5
  }));

  // Create mountains
  const mountains = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    width: Math.random() * 100 + 100,
    height: Math.random() * 60 + 40,
    left: i * 150 - 50,
    opacity: 0.7 + Math.random() * 0.3
  }));

  // Create trees
  const trees = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    left: i * 100 + Math.random() * 50,
    scale: 0.8 + Math.random() * 0.4
  }));

  // Create traffic signs
  const signs = [
    { id: 1, left: '30%', symbol: '!' },
    { id: 2, left: '70%', symbol: '30' }
  ];

  // Create rain droplets
  const rainDrops = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    animationDuration: Math.random() * 0.5 + 0.5
  }));

  return (
    <div 
      className={`bus-scene ${isNight ? 'night' : 'day'} ${currentWeather ? `weather-${currentWeather}` : ''} ${sceneTransition ? 'scene-transition' : ''}`}
      style={{ height: '200px' }}
    >
      {/* Sun or Moon with smooth transitions */}
      <motion.div 
        className={`sun-moon ${isNight ? 'moon' : 'sun'}`}
        animate={animate ? {
          y: isNight ? [0, -10, 0] : [0, 10, 0]
        } : {}}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Stars (always rendered but only visible at night through CSS) */}
      <div className="stars">
        {stars.map(star => (
          <motion.div
            key={star.id}
            className="star"
            style={{
              width: star.size,
              height: star.size,
              top: `${star.top}%`,
              left: `${star.left}%`
            }}
            animate={animate ? {
              opacity: [0.3, 1, 0.3]
            } : {}}
            transition={{
              duration: 2,
              delay: star.blinkDelay,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}
      </div>

      {/* Moving clouds with smooth transitions */}
      <motion.div 
        className="clouds"
        animate={animate ? {
          x: ['-100%', '100%']
        } : {}}
        transition={{
          repeat: Infinity,
          duration: 60, // Slower for smoother movement
          ease: "linear",
          repeatType: "loop"
        }}
      >
        {[...Array(5)].map((_, i) => (
          <motion.div 
            key={i} 
            className="cloud"
            style={{
              left: `${i * 25}%`,
              top: `${5 + i * 4}px`,
              opacity: 0.7 + (i * 0.05),
              transform: `scale(${0.7 + (i * 0.2)})`,
            }}
            animate={animate ? {
              y: [0, -3, 0, 3, 0]
            } : {}}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>

      {/* Mountains in the background with smoother animation */}
      <motion.div 
        className="mountains"
        animate={animate ? {
          x: [0, -300]
        } : {}}
        transition={{
          repeat: Infinity,
          duration: 60, // Slower for smoother movement
          ease: "linear"
        }}
      >
        {mountains.map(mountain => (
          <div
            key={mountain.id}
            className="mountain"
            style={{
              width: mountain.width,
              height: mountain.height,
              left: mountain.left,
              opacity: mountain.opacity
            }}
          />
        ))}
      </motion.div>

      {/* Trees with smoother animation */}
      <motion.div 
        className="trees-container"
        animate={animate ? {
          x: [800, -800]
        } : {}}
        transition={{
          repeat: Infinity,
          duration: 40, // Slower for smoother movement
          ease: "linear"
        }}
      >
        {trees.map(tree => (
          <div
            key={tree.id}
            className="tree"
            style={{
              left: tree.left,
              transform: `scale(${tree.scale})`
            }}
          >
            <div className="tree-trunk" />
            <div className="tree-top" />
          </div>
        ))}
      </motion.div>

      {/* Traffic Signs with smoother animation */}
      <motion.div
        animate={animate ? {
          x: [800, -800]
        } : {}}
        transition={{
          repeat: Infinity,
          duration: 30, // Slower for smoother movement
          ease: "linear"
        }}
      >
        {signs.map(sign => (
          <div 
            key={sign.id} 
            className="traffic-sign" 
            style={{ left: sign.left }}
          >
            <div className="sign-post" />
            <div className="sign-top">{sign.symbol}</div>
          </div>
        ))}
      </motion.div>

      {/* Weather Effects Container */}
      <div className="weather-container">
        {/* Rain Effect */}
        <div className="rain-container">
          {rainDrops.map(drop => (
            <motion.div
              key={drop.id}
              className="rain-drop"
              style={{
                left: `${drop.left}%`,
                top: `${drop.top}%`
              }}
              animate={animate ? {
                y: [0, 200],
                opacity: [1, 0.7]
              } : {}}
              transition={{
                duration: drop.animationDuration,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>
      </div>

      {/* Moving road */}
      <div className="road">
        <div className="road-lines" />
      </div>

      {/* Bus with smoother animation */}
      <motion.div 
        className="bus-container"
        initial={{ x: -150 }}
        animate={animate ? {
          x: [-150, window.innerWidth + 150],
          y: [0, -2, 0, 2, 0],
          rotate: [0, 0.5, 0, -0.5, 0] // Reduced rotation for smoother effect
        } : {}}
        transition={{
          x: {
            repeat: Infinity,
            duration: 12, // Slower for smoother movement
            ease: "linear"
          },
          y: {
            repeat: Infinity,
            duration: 2, // Slower bounce for smoother effect
            ease: "easeInOut"
          },
          rotate: {
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut"
          }
        }}
      >
        <div className="bus">
          {/* Bus body */}
          <div className="bus-body">
            {/* Bus Front */}
            <div className="bus-front">
              <div className="headlight" />
            </div>

            {/* Windows with passengers */}
            <div className="windows">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="window">
                  <motion.div 
                    className="passenger" 
                    animate={animate ? { 
                      y: [-1, 1, -1] 
                    } : {}}
                    transition={{
                      duration: 1.5, // Slower for smoother effect
                      delay: i * 0.2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="taillight" />
            <motion.div 
              className="wheel front-wheel"
              animate={animate ? { rotate: 360 } : {}}
              transition={{
                duration: 1.2, // Slower for smoother rotation
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <motion.div 
              className="wheel back-wheel"
              animate={animate ? { rotate: 360 } : {}}
              transition={{
                duration: 1.2, // Slower for smoother rotation
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>
          
          {/* Smoke effect */}
          <div className="smoke-container">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="smoke-particle"
                initial={{ opacity: 0, scale: 0.5, x: 0 }}
                animate={animate ? {
                  opacity: [0, 0.7, 0],
                  scale: [0.5, 1.2, 2],
                  x: [-5, -40],
                  y: [0, -15]
                } : {}}
                transition={{
                  repeat: Infinity,
                  duration: 2, // Slower for smoother effect
                  delay: i * 0.3,
                  ease: "easeOut",
                  times: [0, 0.6, 1]
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BusAnimation;