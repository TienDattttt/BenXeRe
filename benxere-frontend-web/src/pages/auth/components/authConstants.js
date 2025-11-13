import * as Yup from "yup";

// Animation variants
export const formVariants = {
  initial: { opacity: 0, x: 50, filter: 'blur(10px)' },
  animate: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    x: -50,
    filter: 'blur(10px)',
    transition: {
      duration: 0.3
    }
  }
};

export const panelVariants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 20
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const backgroundVariants = {
  initial: { opacity: 0, scale: 1.1 },
  animate: {
    opacity: 0.2,
    scale: 1,
    transition: {
      duration: 1.5,
      ease: "easeOut"
    }
  }
};

// Validation schemas
export const loginSchema = Yup.object().shape({
  email: Yup.string().email("Email không hợp lệ").required("Bắt buộc"),
  password: Yup.string().required("Bắt buộc"),
});

export const signupSchema = Yup.object().shape({
  email: Yup.string().email("Email không hợp lệ").required("Bắt buộc"),
  password: Yup.string()
    .min(8, "Tối thiểu 8 ký tự")
    .required("Bắt buộc"),
  firstName: Yup.string().required("Bắt buộc"),
  lastName: Yup.string().required("Bắt buộc"),
  phone: Yup.string().matches(/^[0-9]{10}$/, "Số điện thoại không hợp lệ"),
});