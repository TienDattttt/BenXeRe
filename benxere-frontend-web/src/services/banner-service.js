import API from './api';

const getToken = () => {
  return localStorage.getItem('token');
};

export const createBanner = async (bannerData) => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  const response = await API.post('/api/banners', bannerData, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

export const getAllBanners = async () => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  const response = await API.get('/api/banners', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

export const getBannerById = async (id) => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  const response = await API.get(`/api/banners/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

export const updateBanner = async (id, bannerData) => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  const response = await API.put(`/api/banners/${id}`, bannerData, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

export const deleteBanner = async (id) => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  await API.delete(`/api/banners/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};