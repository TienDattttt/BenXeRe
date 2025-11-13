import api from './api';

class StatisticsService {
  async getBusStatistics(busId) {
    try {
      const response = await api.get(`/bus-owner/buses/${busId}/statistics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching bus statistics:', error);
      throw error;
    }
  }

  async getEmployeeStatistics(employeeId) {
    try {
      const response = await api.get(`/bus-owner/employees/${employeeId}/statistics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching employee statistics:', error);
      throw error;
    }
  }
}

export const statisticsService = new StatisticsService(); 