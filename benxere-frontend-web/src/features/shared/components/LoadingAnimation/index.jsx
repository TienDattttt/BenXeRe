import React from 'react';
import PropTypes from 'prop-types';
import './styles.css';

const LoadingAnimation = ({ 
  message = 'Loading...',
  size = 'medium',
  overlay = false,
  fullScreen = false,
}) => {
  const containerClass = `loading-container ${fullScreen ? 'full-screen' : ''} ${overlay ? 'with-overlay' : ''}`;
  const spinnerClass = `loading-spinner ${size}`;

  return (
    <div className={containerClass}>
      <div className="loading-content">
        <div className={spinnerClass}>
          <svg className="spinner" viewBox="0 0 50 50">
            <circle
              className="path"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="4"
            />
          </svg>
        </div>
        {message && (
          <div className="loading-message">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

LoadingAnimation.propTypes = {
  message: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  overlay: PropTypes.bool,
  fullScreen: PropTypes.bool,
};

export default React.memo(LoadingAnimation);