import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Formik, Form } from "formik";
import * as Yup from "yup";

// Components
import Button from "../../../components/core/button";
import InputField from "../../../components/core/form-controls/input-field";
import Loader from "../../../components/core/loader";
import Typography from "../../../components/core/typography";

// Services
import { resetPasswordWithOtp } from "../../../services/authService";

// Form validation schema
const resetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường, một số và một ký tự đặc biệt"
    )
    .required("Vui lòng nhập mật khẩu mới"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Mật khẩu không khớp")
    .required("Vui lòng xác nhận lại mật khẩu"),
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Get state from location
  const email = location.state?.email || "";
  const otp = location.state?.otp || "";
  
  // If no email or otp, redirect to forgot password
  useEffect(() => {
    if (!email || !otp) {
      navigate("/auth/forgot-password");
    }
  }, [email, otp, navigate]);

  const handleSubmit = async (values) => {
    setIsLoading(true);
    setError("");
    
    try {
      // Call the API to reset password with email, OTP, and new password
      await resetPasswordWithOtp({
        email,
        otp,
        newPassword: values.password
      });
      
      setIsSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/auth");
      }, 2000);
      
    } catch (error) {
      setError(error.message || "Không thể đặt lại mật khẩu. Vui lòng thử lại sau.");
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
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          
          <Typography variant="h2" className="text-2xl font-bold mb-2">
            Đặt lại mật khẩu
          </Typography>
          
          <Typography variant="body2" className="text-gray-600">
            Vui lòng nhập mật khẩu mới cho tài khoản
            <br />
            <span className="font-medium text-gray-800">{email}</span>
          </Typography>
        </div>

        {isSuccess ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-lg p-6 text-center"
          >
            <div className="flex flex-col items-center space-y-3">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <Typography variant="h3" className="font-medium">
                Đặt lại mật khẩu thành công!
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Bạn đang được chuyển hướng đến trang đăng nhập...
              </Typography>
            </div>
          </motion.div>
        ) : (
          <Formik
            initialValues={{ password: "", confirmPassword: "" }}
            validationSchema={resetPasswordSchema}
            onSubmit={handleSubmit}
          >
            {({ isValid, dirty }) => (
              <Form className="space-y-6">
                <InputField
                  name="password"
                  label="Mật khẩu mới"
                  type="password"
                  icon="lock"
                  placeholder="••••••••"
                  showStrength
                />

                <InputField
                  name="confirmPassword"
                  label="Xác nhận mật khẩu"
                  type="password"
                  icon="lock"
                  placeholder="••••••••"
                />

                {error && (
                  <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  disabled={!isValid || !dirty || isLoading}
                  className="w-full justify-center group"
                >
                  {isLoading ? (
                    <Loader className="text-white" />
                  ) : (
                    <span className="group-hover:transform group-hover:translate-x-1 transition-transform">
                      Đặt lại mật khẩu
                    </span>
                  )}
                </Button>

                <div className="text-center">
                  <button 
                    type="button" 
                    onClick={() => navigate("/auth/otp-verification", { state: { email } })}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Quay lại
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;