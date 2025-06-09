// Конфигурация API
const API_CONFIG = {
  BASE_URL: '/api', // Используем относительный путь для прокси
  ENDPOINTS: {
    CITIES: {
      path: '/places/cities',
      method: 'GET'
    },
    // Можно добавить другие эндпоинты по аналогии
  }
};

// Генератор URL для API
export const getApiUrl = (endpointKey) => {
  const endpoint = API_CONFIG.ENDPOINTS[endpointKey];
  if (!endpoint) throw new Error(`Unknown endpoint: ${endpointKey}`);
  
  return `${API_CONFIG.BASE_URL}${endpoint.path}`;
};

// Получение конфига для запроса
export const getApiConfig = (endpointKey, data = null) => {
  const endpoint = API_CONFIG.ENDPOINTS[endpointKey];
  if (!endpoint) throw new Error(`Unknown endpoint: ${endpointKey}`);

  return {
    method: endpoint.method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    ...(data && { body: JSON.stringify(data) })
  };
};