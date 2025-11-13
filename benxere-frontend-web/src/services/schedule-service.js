import API from './api';
import { parse, format } from 'date-fns';

const getToken = () => {
  return localStorage.getItem('token');
};

export const getScheduleById = async (id) => {
  const response = await API.get(`/api/schedules/${id}`);
  return response.data;
};

export const getAllSchedules = async () => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  const response = await API.get('/api/schedules/all', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

export const createSchedule = async (schedule) => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  const response = await API.post('/api/schedules/create', schedule, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

export const updateSchedule = async (id, schedule) => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }
  console.log("Schedule:", schedule);
  const response = await API.put(`/api/schedules/${id}`, schedule, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

export const deleteSchedule = async (id) => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  await API.delete(`/api/schedules/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

export const getSchedulesByOriginAndDestinationAndDate = async (originCode, destinationCode, date) => {
  // const token = getToken();
  // if (!token) {
  //   return Promise.reject('No token found');
  // }

  const parsedDate = parse(date, 'dd-MM-yyyy', new Date());
  const formattedDate = format(parsedDate, 'dd-MM-yyyy'); 

  console.log('API Request:', {
    url: '/api/schedules/search',
    params: {
      originCode,
      destinationCode,
      date: formattedDate,
    },
    // headers: {
    //   'Authorization': `Bearer ${token}`
    // }
  });

  const response = await API.get('/api/schedules/search', {
    params: {
      originCode,
      destinationCode,
      date: formattedDate,
    },
    // headers: {
    //   'Authorization': `Bearer ${token}`
    // }
  });
  console.log('API Response:', response.data);
  return response.data;
};
export const createMultipleSchedules = async (schedule, numberOfSchedules) => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  const response = await API.post('/api/schedules/create-multi', schedule, {
    params: {
      numberOfSchedules
    },
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

/**
 * Get schedule issues for a specific schedule
 * @param {number} scheduleId - The schedule ID
 * @returns {Promise<Array>} List of schedule issues
 */
export const getScheduleIssues = async (scheduleId) => {
  try {
    console.log(`Fetching issues for schedule ${scheduleId}`);
    const response = await API.get(`/schedules/${scheduleId}/issues`);
    console.log('Schedule issues API response:', response.data);
    
    // Handle different response formats
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && typeof response.data === 'object') {
      // Check for common response wrapper formats
      if (Array.isArray(response.data.result)) {
        return response.data.result;
      } else if (Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (Array.isArray(response.data.issues)) {
        return response.data.issues;
      } else if (response.data.result && typeof response.data.result === 'object') {
        return [response.data.result]; // Single issue wrapped in result
      }
    }
    
    // Default to empty array if no valid format found
    return [];
  } catch (error) {
    console.error(`Error fetching schedule issues for schedule ${scheduleId}:`, error);
    return [];
  }
};

/**
 * Get current status of a schedule
 * @param {number} scheduleId - The schedule ID
 * @returns {Promise<Object>} Schedule status information
 */
export const getScheduleStatus = async (scheduleId) => {
  try {
    console.log(`Fetching status for schedule ${scheduleId}`);
    const response = await API.get(`/schedules/${scheduleId}/status`);
    console.log('Schedule status API response:', response.data);
    
    // Handle different response formats
    if (response.data && typeof response.data === 'object') {
      // If data is already in expected format
      if (response.data.status !== undefined) {
        return response.data;
      }
      
      // Check for common response wrapper formats
      if (response.data.result && typeof response.data.result === 'object') {
        return response.data.result;
      } else if (response.data.data && typeof response.data.data === 'object') {
        return response.data.data;
      }
    }
    
    // Default to empty object if no valid format found
    return {};
  } catch (error) {
    console.error(`Error fetching schedule status for schedule ${scheduleId}:`, error);
    return {};
  }
};

export default {
  getScheduleIssues,
  getScheduleStatus
};
