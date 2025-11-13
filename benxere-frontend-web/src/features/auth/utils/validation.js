/**
 * Regular expressions for validation
 */
const REGEX = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/,
  PHONE: /^(0|\+84)[3|5|7|8|9][0-9]{8}$/,
};

/**
 * Validate email format
 * @param {string} email
 * @returns {{ isValid: boolean, message: string | null }}
 */
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }
  if (!REGEX.EMAIL.test(email)) {
    return { isValid: false, message: 'Invalid email format' };
  }
  return { isValid: true, message: null };
};

/**
 * Validate password strength
 * @param {string} password
 * @returns {{ isValid: boolean, message: string | null }}
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  if (password.length < 8) {
    return { 
      isValid: false, 
      message: 'Password must be at least 8 characters long' 
    };
  }
  if (!REGEX.PASSWORD.test(password)) {
    return { 
      isValid: false, 
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
    };
  }
  return { isValid: true, message: null };
};

/**
 * Validate phone number format
 * @param {string} phone
 * @returns {{ isValid: boolean, message: string | null }}
 */
export const validatePhone = (phone) => {
  if (!phone) {
    return { isValid: false, message: 'Phone number is required' };
  }
  if (!REGEX.PHONE.test(phone)) {
    return { 
      isValid: false, 
      message: 'Invalid phone number format. Must be a valid Vietnamese phone number' 
    };
  }
  return { isValid: true, message: null };
};

/**
 * Validate registration data
 * @param {import('../types').RegisterData} data
 * @returns {{ isValid: boolean, errors: Object.<string, string> }}
 */
export const validateRegistration = (data) => {
  const errors = {};
  
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message;
  }

  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.message;
  }

  if (!data.name?.trim()) {
    errors.name = 'Name is required';
  }

  const phoneValidation = validatePhone(data.phone);
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.message;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate password change data
 * @param {Object} data
 * @param {string} data.currentPassword
 * @param {string} data.newPassword
 * @param {string} data.confirmPassword
 * @returns {{ isValid: boolean, errors: Object.<string, string> }}
 */
export const validatePasswordChange = (data) => {
  const errors = {};

  if (!data.currentPassword) {
    errors.currentPassword = 'Current password is required';
  }

  const newPasswordValidation = validatePassword(data.newPassword);
  if (!newPasswordValidation.isValid) {
    errors.newPassword = newPasswordValidation.message;
  }

  if (data.newPassword !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (data.currentPassword === data.newPassword) {
    errors.newPassword = 'New password must be different from current password';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};