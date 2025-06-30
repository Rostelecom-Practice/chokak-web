import { apiRequest } from './api';

export const CityService = {
  getCities: async () => {
    try {
      return await apiRequest('CITIES');
    } catch (error) {
      console.error('Failed to load cities:', error);
      throw new Error('Не удалось загрузить список городов');
    }
  }
};