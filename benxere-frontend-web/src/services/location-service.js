import API from './api';

const getToken = () => {
  return localStorage.getItem('token');
};

export const getAllLocations = async () => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  const response = await API.get('/api/locations', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

export const getLocationById = async (id) => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  const response = await API.get(`/api/locations/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

export const createLocation = async (locationData) => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  const response = await API.post('/api/locations', locationData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

export const updateLocation = async (id, locationData) => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  const response = await API.put(`/api/locations/${id}`, locationData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

export const deleteLocation = async (id) => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  await API.delete(`/api/locations/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

export const getLocationRecommendations = async (query) => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  const response = await API.get(`/api/locations/recommendations?query=${query}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

export const getPickUpSchedules = async (scheduleId) => {
  try {
    const token = getToken();
    if (!token) {
      console.warn('No token found for fetching pickup locations');
      return [];
    }

    const response = await API.get(`/api/locations/pick-up/schedules/${scheduleId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data || [];
  } catch (error) {
    console.error('Error fetching pickup locations:', error);
    return [];
  }
};

export const getDropOffSchedules = async (scheduleId) => {
  try {
    const token = getToken();
    if (!token) {
      console.warn('No token found for fetching dropoff locations');
      return [];
    }

    const response = await API.get(`/api/locations/drop-off/schedules/${scheduleId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data || [];
  } catch (error) {
    console.error('Error fetching dropoff locations:', error);
    return [];
  }
};