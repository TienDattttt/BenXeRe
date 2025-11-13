import React from 'react';
import './loading-animation.css';

const LoadingAnimation = () => {
  return (
    <div className="animation-container">
      {/* Clouds */}
      <div className="cloud">☁️</div>
      <div className="cloud">☁️</div>
      <div className="cloud">☁️</div>

      {/* Road */}
      <div className="road"></div>
      
      {/* Bus */}
      <div className="bus">
        🚌
      </div>
      
      {/* Scenery elements */}
      <div className="scenery">
        <div className="mountain" style={{ left: '10%' }}>🗻</div>
        <div className="tree" style={{ left: '25%' }}>🌳</div>
        <div className="house" style={{ left: '40%' }}>🏠</div>
        <div className="tree" style={{ left: '55%' }}>🌴</div>
        <div className="house" style={{ left: '70%' }}>🏡</div>
        <div className="tree" style={{ left: '85%' }}>🌲</div>
        <div className="mountain" style={{ left: '95%' }}>🗻</div>
      </div>

      {/* Loading text */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white font-bold text-lg">
        Đang tìm chuyến xe...
      </div>
    </div>
  );
};

export default LoadingAnimation;