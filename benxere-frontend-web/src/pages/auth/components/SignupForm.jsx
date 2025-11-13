import React from 'react';
import { Formik, Form } from "formik";
import InputField from "../../../components/core/form-controls/input-field";
import Button from "../../../components/core/button";
import Loader from "../../../components/core/loader";
import { signupSchema } from "./authConstants";
import ErrorMessage from './ErrorMessage';

const SignupForm = ({ handleAuth, errorMessage, isLoading }) => {
  return (
    <Formik
      initialValues={{
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phone: "",
      }}
      validationSchema={signupSchema}
      onSubmit={(values) => handleAuth(values, false)}
    >
      {({ isValid, dirty }) => (
        <Form className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              name="firstName"
              label="Họ"
              type="text"
              icon="user"
              placeholder="Nguyễn"
            />
            <InputField
              name="lastName"
              label="Tên"
              type="text"
              placeholder="Văn A"
            />
          </div>

          <InputField
            name="email"
            label="Email"
            type="email"
            icon="envelope"
            placeholder="example@benxeso.vn"
          />

          <InputField
            name="phone"
            label="Số điện thoại"
            type="tel"
            icon="phone"
            placeholder="0912345678"
          />

          <InputField
            name="password"
            label="Mật khẩu"
            type="password"
            icon="lock"
            placeholder="••••••••"
            showStrength
          />

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
                Tạo tài khoản
              </span>
            )}
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default SignupForm;