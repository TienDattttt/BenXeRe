import API from './api';
import authService from './auth-service';

const getToken = () => {
  return localStorage.getItem('token');
};

export const createUser = async (userData) => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  const response = await API.post('/users', userData, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

export const getAllUsers = async () => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  const response = await API.get('/users', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

export const getUserById = async (id) => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  const response = await API.get(`/users/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.data.result || response.data;
};

export const updateUser = async (id, userData) => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  const response = await API.put(`/users/${id}`, userData, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

export const deleteUser = async (id) => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  await API.delete(`/users/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

export const getCurrentUserId = async () => {
  const userId = authService.getUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  return userId;
};

export const getMyInfo = async () => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  const response = await API.get('/users/my-info', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data.result;
};

export const updateMyInfo = async (userData) => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  const response = await API.post('/users/my-info', userData, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data.result;
};

export const getMyEmployees = async () => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  const response = await API.get('/users/employees', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }); 
  return response.data.result;
}

export const createEmployee = async (employeeData) => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  // Create a copy of employeeData to avoid modifying the original
  const newEmployeeData = { ...employeeData };
  
  // Ensure workStartTime and workEndTime are properly formatted and only sent for CUSTOMER_CARE role
  if (newEmployeeData.roleId === '9') {
    // Make sure workStartTime and workEndTime are included for CUSTOMER_CARE employees
    if (!newEmployeeData.workStartTime || !newEmployeeData.workEndTime) {
      console.warn('Missing work hours for CUSTOMER_CARE employee');
    }
  } else {
    // Remove workStartTime and workEndTime if not CUSTOMER_CARE role
    delete newEmployeeData.workStartTime;
    delete newEmployeeData.workEndTime;
  }

  console.log('Creating employee with data:', newEmployeeData);
  
  const response = await API.post('/users/employees', newEmployeeData, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

export const updateEmployee = async (employeeId, employeeData) => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  // Create a copy of employeeData to avoid modifying the original
  const updatedData = { ...employeeData };
  
  // Ensure workStartTime and workEndTime are properly formatted and only sent for CUSTOMER_CARE role
  if (updatedData.roleId === '9') {
    // Always include workStartTime and workEndTime for CUSTOMER_CARE, even if they're null
    // The backend will handle null values appropriately
    console.log('Updating CUSTOMER_CARE employee with work hours:', {
      workStartTime: updatedData.workStartTime,
      workEndTime: updatedData.workEndTime
    });
  } else {
    // Remove workStartTime and workEndTime if not CUSTOMER_CARE role
    delete updatedData.workStartTime;
    delete updatedData.workEndTime;
  }

  console.log('Updating employee with data:', updatedData);
  
  const response = await API.put(`/users/${employeeId}`, updatedData, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

export const getRoles = async () => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  const response = await API.get('/roles', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

/**
 * Get a user's profile by ID
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} The user profile
 */
export const getUserProfile = async (userId) => {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching user profile for ID ${userId}:`, error);
    return null;
  }
};

/**
 * Get the current user's profile
 * @returns {Promise<Object>} The current user's profile
 */
export const getCurrentUserProfile = async () => {
  try {
    const userId = await getCurrentUserId();
    return await getUserProfile(userId);
  } catch (error) {
    console.error('Error fetching current user profile:', error);
    return null;
  }
};

/**
 * Get users by role
 * @param {string} role - The role to filter by
 * @returns {Promise<Array>} List of users with the specified role
 */
export const getUsersByRole = async (role) => {
  try {
    const response = await fetch(`/api/users/by-role/${role}`, {
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch users with role: ${role}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching users with role ${role}:`, error);
    return [];
  }
};

/**
 * Update user profile
 * @param {Object} profileData - The profile data to update
 * @returns {Promise<Object>} The updated user profile
 */
export const updateUserProfile = async (profileData) => {
  try {
    const userId = await getCurrentUserId();
    
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authService.getToken()}`
      },
      body: JSON.stringify(profileData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update user profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Get the current user's role
 * @returns {Promise<string>} The current user's role
 */
export const getCurrentUserRole = async () => {
  return authService.getUserRole();
};

/**
 * Check if the current user has a specific role
 * @param {string|Array} roles - Role or array of roles to check
 * @returns {Promise<boolean>} True if the user has any of the specified roles
 */
export const hasRole = async (roles) => {
  const userRole = await getCurrentUserRole();
  
  if (!userRole) {
    return false;
  }
  
  if (Array.isArray(roles)) {
    return roles.includes(userRole);
  }
  
  return userRole === roles;
};

export const getUserByEmail = async (email) => {
  try {
    const response = await API.get(`/users/email/${email}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw error;
  }
};

/**
 * Get available customer care agent based on current time
 * @param {number} ownerId - The bus owner ID
 * @returns {Promise<Object>} Available customer care agent or bus owner as fallback
 */
export const getAvailableCustomerCare = async (ownerId) => {
  const token = getToken();
  if (!token) {
    return Promise.reject('No token found');
  }

  try {
    const response = await API.get(`/users/${ownerId}/employees`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const employees = response.data.result || [];
    console.log("Employees", employees);
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    
    const workingCustomerCare = employees.filter(employee => {
      if (employee.role !== 'CUSTOMER_CARE' || !employee.workStartTime || !employee.workEndTime) {
        return false;
      }
      
      const [startHours, startMinutes] = employee.workStartTime.split(':').map(Number);
      const [endHours, endMinutes] = employee.workEndTime.split(':').map(Number);
      
      const startTimeInMinutes = startHours * 60 + startMinutes;
      const endTimeInMinutes = endHours * 60 + endMinutes;
      
      return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;
    });
    
    if (workingCustomerCare.length > 0) {
      console.log('Found working customer care agent', workingCustomerCare[0]);
      return workingCustomerCare[0];
    }
    
    const futureCustomerCare = employees.filter(employee => {
      if (employee.role !== 'CUSTOMER_CARE' || !employee.workStartTime) {
        return false;
      }
      
      const [startHours, startMinutes] = employee.workStartTime.split(':').map(Number);
      
      const startTimeInMinutes = startHours * 60 + startMinutes;
      
      return startTimeInMinutes > currentTimeInMinutes;
    });
    
    futureCustomerCare.sort((a, b) => {
      const [aHours, aMinutes] = a.workStartTime.split(':').map(Number);
      const [bHours, bMinutes] = b.workStartTime.split(':').map(Number);
      
      const aTime = aHours * 60 + aMinutes;
      const bTime = bHours * 60 + bMinutes;
      
      return aTime - bTime;
    });
    
    if (futureCustomerCare.length > 0) {
      console.log('Found future customer care agent', futureCustomerCare[0]);
      return futureCustomerCare[0];
    }
    
    const ownerResponse = await API.get(`/users/${ownerId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const owner = ownerResponse.data.result || ownerResponse.data;
    console.log('No customer care found, returning bus owner', owner);
    return owner;
  } catch (error) {
    console.error('Error getting available customer care agent:', error);
    
    if (ownerId) {
      try {
        const ownerResponse = await API.get(`/users/${ownerId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        return ownerResponse.data.result || ownerResponse.data;
      } catch (innerError) {
        console.error('Error getting bus owner as fallback:', innerError);
        throw innerError;
      }
    }
    
    throw error;
  }
};

// Default export
const userService = {
  getCurrentUserId,
  getUserProfile,
  getCurrentUserProfile,
  getUsersByRole,
  updateUserProfile,
  getCurrentUserRole,
  hasRole
};

export default userService;