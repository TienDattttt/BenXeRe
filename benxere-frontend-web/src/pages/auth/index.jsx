import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { signIn, signUp } from "../../utils/axios";
import Button from "../../components/core/button";

import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import LeftPanel from "./components/LeftPanel";

import { formVariants, panelVariants } from "./components/authConstants";

const AuthPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (values, isLogin) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = isLogin ? await signIn(values) : await signUp(values);
      if (response?.result?.token) {
        localStorage.setItem('token', response.result.token);
        navigate(isLogin ? "/" : "/auth");
        window.location.reload();
      }
    } catch (error) {
      let errorMsg = "Đã xảy ra lỗi. Vui lòng thử lại.";
      const message = error.message;
      if (message) {
        switch (message) {
          case "User not existed":
            errorMsg = "Tài khoản không tồn tại. Vui lòng kiểm tra lại email.";
            break;
          case "Unauthenticated":
            errorMsg = "Sai mật khẩu. Vui lòng thử lại.";
            break;
          default:
            errorMsg = message;
        }
      }
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <motion.div 
        variants={panelVariants}
        initial="initial"
        animate="animate"
        className="w-full max-w-4xl mx-4 bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="flex flex-col md:flex-row">
          {/* Left Panel */}
          <LeftPanel activeTab={activeTab} isLoading={isLoading} />

          {/* Right Panel - Form */}
          <div className="md:w-3/5 p-8 md:p-12">
            <div className="flex gap-4 mb-8">
              {["login", "signup"].map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? "primary" : "text"}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    text-lg relative overflow-hidden
                    ${activeTab === tab ? 'shadow-lg transform scale-105' : ''}
                  `}
                >
                  {tab === "login" ? "Đăng nhập" : "Đăng ký"}
                  {activeTab === tab && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                      layoutId="activeTab"
                    />
                  )}
                </Button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={formVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ type: "tween", duration: 0.3 }}
              >
                {activeTab === "login" ? (
                  <LoginForm 
                    handleAuth={handleAuth} 
                    errorMessage={errorMessage}
                    isLoading={isLoading}
                  />
                ) : (
                  <SignupForm 
                    handleAuth={handleAuth} 
                    errorMessage={errorMessage}
                    isLoading={isLoading}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;