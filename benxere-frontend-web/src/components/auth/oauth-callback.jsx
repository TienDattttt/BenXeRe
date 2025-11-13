import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { handleOAuthToken } from '../../services/authService';
import Loader from '../core/loader';

const OAuthCallback = () => {
  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      console.log('token', token);
      if (!token) {
        throw new Error('No token provided');
      }

      const authResult = handleOAuthToken(token);
      if (authResult.authenticated) {
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
        
      } else {
        throw new Error(authResult.error || 'Authentication failed');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setRedirect(
        <Navigate
          to="/auth"
          replace
          state={{ error: 'Đăng nhập thất bại. Vui lòng thử lại.' }}
        />
      );
    }
  }, []);

  if (redirect) return redirect;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader className="w-12 h-12 text-blue-600" />
    </div>
  );
};

export default OAuthCallback;