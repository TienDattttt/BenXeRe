import React from 'react';

// Local components
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import StatisticsSection from './components/StatisticsSection';
import FeaturesSection from './components/FeaturesSection';

const RegisterBusPage = () => {
  return (
    <div className="bg-gray-100">
      <Header />
      <HeroSection />
      <StatisticsSection />
      <FeaturesSection />
    </div>
  );
};

export default RegisterBusPage;