import React from 'react';
import { Formik, Form } from "formik";
import { useNavigate } from "react-router-dom";
import InputField from "../../../components/core/form-controls/input-field";
import Button from "../../../components/core/button";
import Loader from "../../../components/core/loader";
import { SocialAuthButtons } from "../../../components/auth/social-auth-buttons";
import { loginSchema } from "./authConstants";
import ErrorMessage from './ErrorMessage';

const LoginForm = ({ handleAuth, errorMessage, isLoading }) => {
  const navigate = useNavigate();
  
  return (
    <Formik
      initialValues={{ email: "", password: "" }}
      validationSchema={loginSchema}
      onSubmit={(values) => handleAuth(values, true)}
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
          <InputField
            name="password"
            label="Mật khẩu"
            type="password"
            icon="lock"
            placeholder="••••••••"
            autoComplete="current-password"
          />
          
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="form-checkbox text-blue-500" />
              <span className="text-sm text-gray-600">Ghi nhớ đăng nhập</span>
            </label>
            <button 
              type="button" 
              onClick={() => navigate("/auth/forgot-password")}
              className="text-blue-600 text-sm hover:underline"
            >
              Quên mật khẩu?
            </button>
          </div>

          {errorMessage && <ErrorMessage errorMessage={errorMessage} />}

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
                Đăng nhập
              </span>
            )}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-sm text-gray-500">
                hoặc đăng nhập với
              </span>
            </div>
          </div>

          <SocialAuthButtons />
        </Form>
      )}
    </Formik>
  );
};

export default LoginForm;