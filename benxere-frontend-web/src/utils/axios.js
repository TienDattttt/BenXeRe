import axios from "axios";

export const API = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL}`,
  timeout: 15000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    const { status } = error.response;
    if (status === 403 || status === 401) {
      localStorage.clear();
      window.location.replace("/auth");
    }
    return Promise.reject(error);
  }
);

export function getJSON(url) {
  return API.get(url)
    .then((res) => res)
    .catch((error) => {
      throw error?.response?.data;
    });
}

export function postJSON(url, values) {
  return API.post(url, values)
    .then((res) => res)
    .catch((error) => {
      throw error?.response?.data;
    });
}

export function putJSON(url, values) {
  return API.put(url, values)
    .then((res) => res)
    .catch((error) => {
      throw error?.response?.data;
    });
}

export function patchJSON(url, values) {
  return API.patch(url, values)
    .then((res) => res)
    .catch((error) => {
      throw error?.response?.data;
    });
}

export function deleteJSON(url) {
  return API.delete(url)
    .then((res) => res)
    .catch((error) => {
      throw error?.response?.data;
    });
}

const getCurrentUser = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return Promise.reject('No token found');
  }

  return API.get('/users/my-info', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then((res) => res.data.result)
  .catch((error) => {
    throw error?.response?.data;
  });
};


const signIn = (userData) => {
  return API.post('/auth/token', userData)
    .then((res) => res.data)
    .catch((error) => {
      throw error?.response?.data;
    });
};

const signUp = (userData) => {
  return API.post('/auth/sign-up', userData)
    .then((res) => res.data)
    .catch((error) => {
      throw error?.response?.data;
    });
};

export { signIn, signUp, getCurrentUser };