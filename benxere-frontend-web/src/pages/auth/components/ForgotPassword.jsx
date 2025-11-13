import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Formik, Form } from "formik";
import * as Yup from "yup";

// Components
import Button from "../../../components/core/button";
import InputField from "../../../components/core/form-controls/input-field";
import Loader from "../../../components/core/loader";
import Typography from "../../../components/core/typography";

// Services
import { requestPasswordReset } from "../../../services/authService";

// Form validation
const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email("Email không hợp lệ")
    .required("Vui lòng nhập email"),
});

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (values) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      // Call the updated API endpoint to send OTP
      await requestPasswordReset(values.email);
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/auth/otp-verification", { state: { email: values.email } });
      }, 1000);
    } catch (error) {
      setErrorMessage(error.message || "Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.");
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
          <Typography variant="h2" className="text-2xl font-bold mb-2">
            Quên mật khẩu?
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            Không sao cả. Chúng tôi sẽ gửi một mã xác thực đến email của bạn.
          </Typography>
        </div>

        {isSuccess ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4 text-center"
          >
            <div className="flex flex-col items-center space-y-3">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <Typography variant="h3" className="font-medium">
                Email đã được gửi thành công!
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Vui lòng kiểm tra hộp thư của bạn để nhận mã xác thực.
              </Typography>
            </div>
          </motion.div>
        ) : (
          <Formik
            initialValues={{ email: "" }}
            validationSchema={forgotPasswordSchema}
            onSubmit={handleSubmit}
          >
            {({ isValid, dirty }) => (
              <Form className="space-y-6">
                <InputField
                  name="email"
                  label="Email"
                  type="email"
                  icon="envelope"
                  placeholder="example@benxeso.vn"
                  autoComplete="email"
                />

                {errorMessage && (
                  <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                    {errorMessage}
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
                      Gửi mã xác thực
                    </span>
                  )}
                </Button>

                <div className="text-center">
                  <button 
                    type="button" 
                    onClick={() => navigate("/auth")}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Quay lại đăng nhập
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

export default ForgotPassword;