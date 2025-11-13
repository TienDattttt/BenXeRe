import API from './api';

export const handleOAuthToken = (token) => {
  try {
    if (!token) {
      throw new Error('No token provided');
    }

    // Store the token first
    localStorage.setItem('token', token);
    
    // Decode JWT token to get user info
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      throw new Error('Invalid token format');
    }
    
    const payload = JSON.parse(atob(tokenParts[1]));
    
    // Map the user info from JWT claims
    const user = {
      email: payload.sub,
      role: payload.scope.replace('ROLE_', '').toLowerCase(),
      exp: payload.exp,
      id: payload.jti,
      iat: payload.iat
    };
    
    localStorage.setItem('user', JSON.stringify(user));

    // After storing, trigger validation asynchronously
    validateTokenAsync(token);

    return {
      authenticated: true,
      user
    };
  } catch (error) {
    console.error('Token handling error:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return {
      authenticated: false,
      error: error.message
    };
  }
};

const validateTokenAsync = async (token) => {
  try {
    const response = await API.post('/auth/introspect', { token });
    if (!response.data?.result?.valid) {
      // If token is invalid, clean up and force reload
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
  } catch (error) {
    console.error('Token validation error:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth';
  }
};

export const authenticate = async (credentials) => {
  try {
    const requestData = {
      ...credentials,
      rememberMe: Boolean(credentials.rememberMe)
    };
    
    const response = await API.post('/api/auth/token', requestData);
    const { result } = response.data;
    if (result && result.token) {
      return handleOAuthToken(result.token);
    }
    throw new Error('No token received');
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      authenticated: false,
      error: error.response?.data?.message || error.message
    };
  }
};

export const refreshToken = async (token) => {
  try {
    const response = await API.post('/api/auth/refresh', { token });
    const { result } = response.data;
    if (result?.token) {
      const authResult = handleOAuthToken(result.token);
      if (authResult.authenticated) {
        return authResult;
      }
      throw new Error('Invalid refresh token response');
    }
    throw new Error('No token in refresh response');
  } catch (error) {
    console.error('Token refresh error:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return {
      authenticated: false,
      error: error.response?.data?.message || error.message
    };
  }
};

export const logout = async () => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await API.post('/api/auth/logout', { token });
      } catch (error) {
        console.warn('Server logout notification failed:', error);
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return {
      success: false,
      error: error.message
    };
  }
};

export const isTokenExpired = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.exp) {
      return Date.now() >= user.exp * 1000;
    }
    return true;
  } catch {
    return true;
  }
};

export const signUp = async (userData) => {
  try {
    const response = await API.post('/auth/sign-up', userData);
    const { result } = response.data;
    if (result && result.token) {
      localStorage.setItem('token', result.token);
    }
    return result;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

/**
 * Request a password reset by sending an OTP to the user's email
 * @param {string} email - The user's email address
 * @returns {Promise<{ success: boolean }>}
 */
export const requestPasswordReset = async (email) => {
  try {
    await API.post('/auth/forgot-password/send-otp', { email });
    return { success: true };
  } catch (error) {
    console.error('Forgot password request error:', error);
    throw new Error(error.response?.data?.message || 'Không thể gửi mã xác thực. Vui lòng thử lại sau.');
  }
};

/**
 * Verify the OTP code for password reset
 * @param {string} email - The user's email
 * @param {string} otp - The verification code
 * @returns {Promise<{ success: boolean, isValid: boolean }>}
 */
export const verifyPasswordResetOtp = async (email, otp) => {
  try {
    const response = await API.post('/auth/forgot-password/verify-otp', {
      email,
      otp
    });
const isValid = response.status === 200;
    return { success: true, isValid };
  } catch (error) {
    console.error('OTP verification error:', error);
    throw new Error(error.response?.data?.message || 'Không thể xác thực mã OTP. Vui lòng thử lại.');
  }
};

/**
 * Reset the user's password with the OTP verification
 * @param {Object} data - Reset password data
 * @param {string} data.email - The user's email
 * @param {string} data.otp - The verification code
 * @param {string} data.newPassword - The new password
 * @returns {Promise<{ success: boolean }>}
 */
export const resetPasswordWithOtp = async (data) => {
  try {
    await API.post('/auth/forgot-password/reset-password', {
      email: data.email,
      newPassword: data.newPassword
    });
    return { success: true };
  } catch (error) {
    console.error('Reset password error:', error);
    throw new Error(error.response?.data?.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại sau.');
  }
};
