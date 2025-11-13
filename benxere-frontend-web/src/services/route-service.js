import API from './api';

const getToken = () => {
  return localStorage.getItem('token');
};

export const getAllRoutes = async () => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  const response = await API.get('/api/routes/all', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

export const createRoute = async (route) => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  const response = await API.post('/api/routes/create', route, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

export const getRouteById = async (id) => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  const response = await API.get(`/api/routes/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

export const getRouteByOriginAndDestination = async (origin, destination) => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  const response = await API.get(`/api/routes/${origin}/${destination}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}
export const deleteRoute = async (id) => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  await API.delete(`/api/routes/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}