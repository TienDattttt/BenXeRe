import React from 'react';
import BusWeatherAnimation from '../components/bus-animation/bus-weather';

const BusAnimationDemo = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bus Animation with Weather Transition</h1>
      <div className="w-full max-w-3xl mx-auto shadow-lg rounded-lg overflow-hidden">
        <BusWeatherAnimation />
      </div>
    </div>
  );
};

export default BusAnimationDemo;