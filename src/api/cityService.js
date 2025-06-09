import { getApiUrl, getApiConfig } from './api';

// Базовый обработчик запросов
const apiRequest = async (endpoint) => {
  try {
    const response = await fetch(
      getApiUrl(endpoint),
      getApiConfig(endpoint)
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Сервис для работы с городами
export const CityService = {
  getCities: async () => {
    try {
      const data = await apiRequest('CITIES');
      return data.map(city => ({
        key: city.id.toString(),
        label: city.name,
      }));
    } catch (error) {
      console.error('Failed to load cities:', error);
      throw new Error('Не удалось загрузить список городов');
    }
  }
};