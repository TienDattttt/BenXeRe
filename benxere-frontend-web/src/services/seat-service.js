import API from './api';

const getToken = () => {
  return localStorage.getItem('token');
};

export const createSeat = async (seatData) => {
  const response = await API.post('/api/seats', seatData, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return response.data;
};

export const getSeatById = async (id) => {
  const response = await API.get(`/api/seats/${id}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return response.data;
};

export const getAllSeats = async () => {
  const response = await API.get('/api/seats', {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return response.data;
};

export const updateSeat = async (id, seatData) => {
  const response = await API.put(`/api/seats/${id}`, seatData, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return response.data;
};

export const deleteSeat = async (id) => {
  await API.delete(`/api/seats/${id}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

export const getSeatsByScheduleId = async (scheduleId) => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }
  console.log('API request to fetch booked seats..');
  const response = await API.get(`/api/seats/schedule/${scheduleId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};