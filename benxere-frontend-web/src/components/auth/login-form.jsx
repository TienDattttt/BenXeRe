import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import InputField from "../core/form-controls/input-field";
import Button from "../core/button";
import Typography from "../core/typography";

const loginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email address").required("Required"),
  password: Yup.string().required("Required"),
  rememberMe: Yup.boolean(),
});

const LoginForm = ({ onSubmit, errorMessage, isLoading }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Formik
      initialValues={{ email: "", password: "", rememberMe: false }}
      validationSchema={loginSchema}
      onSubmit={onSubmit}
    >
      {({ isValid, dirty }) => (
        <Form className="space-y-4">
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <Field
              name="email"
              type="email"
              placeholder="work@email.com"
              className="w-full px-4 py-2 border rounded"
            />
            <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <div className="relative">
              <Field
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full px-4 py-2 border rounded"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-4 py-2 text-gray-600"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
          </div>
          <div className="flex items-center mb-4">
            <Field
              type="checkbox"
              name="rememberMe"
              id="rememberMe"
              className="w-4 h-4 mr-2 accent-blue-600"
            />
            <label htmlFor="rememberMe" className="text-sm text-gray-700">
              Ghi nhớ đăng nhập
            </label>
          </div>
          {errorMessage && <Typography color="error">{errorMessage}</Typography>}
          <Button type="submit" disabled={!isValid || !dirty || isLoading} className="w-full">
            {isLoading ? "Loading..." : "Login"}
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default LoginForm;