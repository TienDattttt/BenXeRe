import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layouts/admin/AdminLayout';
import { introspectToken, refreshToken } from '../../services/authService';

const TokenManagement = () => {
  const [token, setToken] = useState('');
  const [refreshTokenValue, setRefreshTokenValue] = useState('');
  const [introspectResult, setIntrospectResult] = useState(null);
  const [refreshResult, setRefreshResult] = useState(null);
  const navigate = useNavigate();

  const handleIntrospect = async () => {
    try {
      const result = await introspectToken(token);
      setIntrospectResult(result);
    } catch (error) {
      console.error('Error introspecting token:', error);
      if (error.response && error.response.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleRefresh = async () => {
    try {
      const result = await refreshToken(refreshTokenValue);
      setRefreshResult(result);
    } catch (error) {
      console.error('Error refreshing token:', error);
      if (error.response && error.response.status === 401) {
        navigate('/login');
      }
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Token Management</h1>
      <div className="mb-4">
        <label className="block text-gray-700">Token</label>
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />
        <button onClick={handleIntrospect} className="bg-blue-500 text-white px-4 py-2 rounded mt-2">
          Introspect Token
        </button>
      </div>
      {introspectResult && (
        <div className="mb-4">
          <h2 className="text-xl font-bold">Introspect Result</h2>
          <pre>{JSON.stringify(introspectResult, null, 2)}</pre>
        </div>
      )}
      <div className="mb-4">
        <label className="block text-gray-700">Refresh Token</label>
        <input
          type="text"
          value={refreshTokenValue}
          onChange={(e) => setRefreshTokenValue(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />
        <button onClick={handleRefresh} className="bg-green-500 text-white px-4 py-2 rounded mt-2">
          Refresh Token
        </button>
      </div>
      {refreshResult && (
        <div className="mb-4">
          <h2 className="text-xl font-bold">Refresh Result</h2>
          <pre>{JSON.stringify(refreshResult, null, 2)}</pre>
        </div>
      )}
    </AdminLayout>
  );
};

export default TokenManagement;