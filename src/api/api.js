const API_CONFIG = {
  BASE_URL: '/api',
  DEFAULT_HEADERS: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  ENDPOINTS: {
    CITIES: {
      path: '/places/cities',
      method: 'GET',
      transform: data => data.map(city => ({
        key: city.id.toString(),
        label: city.name,
      }))
    },
    TOP_PLACES: {
      path: '/organizations/query',
      method: 'POST',
      transform: data => data
    }
  }
};

export const getApiConfig = (endpointKey, data = null) => {
  const endpoint = API_CONFIG.ENDPOINTS[endpointKey];
  if (!endpoint) throw new Error(`Unknown endpoint: ${endpointKey}`);
  
  return {
    method: endpoint.method,
    headers: API_CONFIG.DEFAULT_HEADERS,
    ...(data && { body: JSON.stringify(data) })
  };
};

export const apiRequest = async (endpointKey, data = null) => {
  const endpoint = API_CONFIG.ENDPOINTS[endpointKey];
  if (!endpoint) throw new Error(`Unknown endpoint: ${endpointKey}`);

  try {

    const response = await fetch(
      `${API_CONFIG.BASE_URL}${endpoint.path}`,
      getApiConfig(endpointKey, data)
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpointKey}:`, error);
    throw error;
  }
};