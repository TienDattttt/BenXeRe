import API from '../api';

const getToken = () => {
    return localStorage.getItem('token');
}

export const getBusesByCurrentOwner = async () => {
    const token = getToken();
    if (!token) {
        return Promise.reject('No token found');
    }

    const response = await API.get('/bus-owner/buses', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}

export const getSchedulesByCurrentOwner = async () => {
    const token = getToken();
    if (!token) {
        return Promise.reject('No token found');
    }

    const response = await API.get('/bus-owner/schedules', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
}

export const getMyEmployeesByCurrentOwner = async () => {
    const token = getToken();
    if (!token) {
        return Promise.reject('No token found');
    }

    const response = await API.get('/bus-owner/employees', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    console.log("Employees:", response.data);
    return response.data;
}


export const getReviewsByCurrentOwner = async () => {
    const token = getToken();
    if (!token) {
        return Promise.reject('No token found');
    }
    const response = await API.get('/bus-owner/reviews', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    console.log("Reviews:", response.data);
    return response.data.result;
}
