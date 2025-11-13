import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from "../../../components/core/button";

const ActionButtons = () => {
  const navigate = useNavigate();
  
  const handleBackToHome = () => {
    navigate("/");
  };
  
  return (
    <div className="flex">
      <Button
        className="secondary mx-auto max-w-[300px]"
        onClick={handleBackToHome}
      >
        Go to home
      </Button>
    </div>
  );
};

export default ActionButtons;