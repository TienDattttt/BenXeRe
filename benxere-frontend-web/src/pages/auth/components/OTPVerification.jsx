import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Typography from "../../../components/core/typography";
import Button from "../../../components/core/button";
import Loader from "../../../components/core/loader";
import { requestPasswordReset, verifyPasswordResetOtp } from "../../../services/authService";

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate("/auth/forgot-password");
      return;
    }
    
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [email, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      // Focus on last input
      inputRefs.current[5].focus();
    }
  };

  const handleResendOtp = async () => {
    setCanResend(false);
    setTimer(60);
    setError("");
    
    try {
      await requestPasswordReset(email);
    } catch (error) {
      setError("Không thể gửi lại mã. Vui lòng thử lại sau.");
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    setError("");
    
    if (otp.some(digit => !digit)) {
      setError("Vui lòng nhập đầy đủ mã xác thực.");
      setIsLoading(false);
      return;
    }

    try {
      const fullOtp = otp.join("");
      const { isValid } = await verifyPasswordResetOtp(email, fullOtp);
      
      if (isValid) {
        
        navigate("/auth/reset-password", { 
          state: { 
            email, 
            otp: fullOtp
          }
        });
      } else {
        setError("Mã xác thực không đúng. Vui lòng kiểm tra lại.");
      }
    } catch (error) {
      setError(error.message || "Không thể xác thực mã OTP. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg mx-4 bg-white rounded-2xl shadow-xl overflow-hidden p-8"
      >
        <div className="text-center mb-8">
          <div className="mb-4">
            <img 
              src="/otp.svg" 
              alt="OTP Verification" 
              className="h-24 mx-auto"
            />
          </div>
          
          <Typography variant="h2" className="text-2xl font-bold mb-2">
            Nhập mã xác thực
          </Typography>
          
          <Typography variant="body2" className="text-gray-600">
            Chúng tôi đã gửi mã gồm 6 chữ số đến
            <br />
            <span className="font-medium text-gray-800">{email}</span>
          </Typography>
        </div>

        <div className="mb-8">
          <div className="flex justify-center space-x-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                maxLength="1"
                value={digit}
                onChange={e => handleOtpChange(e, index)}
                onKeyDown={e => handleKeyDown(e, index)}
                onPaste={index === 0 ? handlePaste : null}
                className="w-12 h-14 text-2xl font-bold text-center border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
              />
            ))}
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-red-500 mt-3"
            >
              {error}
            </motion.div>
          )}

          <div className="text-center mt-4">
            {canResend ? (
              <button 
                onClick={handleResendOtp}
                className="text-blue-600 text-sm hover:underline"
              >
                Gửi lại mã
              </button>
            ) : (
              <Typography variant="body2" className="text-gray-500">
                Gửi lại mã sau {timer} giây
              </Typography>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Button
            variant="primary"
            disabled={isLoading || otp.some(digit => !digit)}
            onClick={handleVerifyOtp}
            className="w-full justify-center"
          >
            {isLoading ? (
              <Loader className="text-white" />
            ) : (
              "Xác nhận"
            )}
          </Button>

          <button 
            type="button" 
            onClick={() => navigate("/auth/forgot-password")}
            className="w-full text-center text-blue-600 text-sm hover:underline"
          >
            Quay lại
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default OTPVerification;