import API from './api';

const getToken = () => {
  return localStorage.getItem('token');
};

export const createBus = (busData, images) => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  const formData = new FormData();
  const busRequestData = {
    busNumber: busData.busNumber,
    busType: busData.busType,
    capacity: parseInt(busData.capacity),
    companyName: busData.companyName
  };

  formData.append('busData', new Blob([JSON.stringify(busRequestData)], { type: 'application/json' }));
  
  if (images && images.length > 0) {
    images.forEach(image => {
      formData.append('images', image);
    });
  }

  return API.post('/buses', formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  })
  .then((res) => res.data)
  .catch((error) => {
    throw error?.response?.data;
  });
};

export const getAllBuses = async () => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  const response = await API.get('/buses/all', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

export const updateBus = async (id, busData, images) => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  const formData = new FormData();
  const busRequestData = {
    busNumber: busData.busNumber,
    busType: busData.busType,
    capacity: parseInt(busData.capacity),
    companyName: busData.companyName
  };

  formData.append('busData', new Blob([JSON.stringify(busRequestData)], { type: 'application/json' }));
  
  if (images && images.length > 0) {
    images.forEach(image => {
      formData.append('images', image);
    });
  }

  const response = await API.put(`/buses/${id}`, formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const deleteBus = async (id) => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  await API.delete(`/buses/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

export const getBusById = async (id) => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  const response = await API.get(`/buses/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

export const getBusesByCurrentUser = async () => {
  try {
    const response = await API.get('/bus-owner/buses');
    return response.data;
  } catch (error) {
    console.error('Error fetching user buses:', error);
    throw error;
  }
};