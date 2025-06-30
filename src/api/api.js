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
    },
    REVIEWS: {
      path: '/review/query',
      method: 'POST',
      transform: data => data
    },
    SUBMIT_REVIEW: {
      path: '/review/submit',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('firebaseIdToken')}`,
        'X-User-Uid': localStorage.getItem('firebaseLocalId')
      },
      transform: data => data
    },
    USER_REVIEWS: {
      path: '/users/me/reviews',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('firebaseIdToken')}`,
        'X-User-Uid': localStorage.getItem('firebaseLocalId')
      },
      transform: data => data
    }
  }
};

export const getApiConfig = (endpointKey, data = null) => {
  const endpoint = API_CONFIG.ENDPOINTS[endpointKey];
  if (!endpoint) throw new Error(`Unknown endpoint: ${endpointKey}`);
  
  let endpointHeaders = {};
  
  if (typeof endpoint.headers === 'function') {
    endpointHeaders = endpoint.headers();
  } else if (endpoint.headers) {
    endpointHeaders = Object.fromEntries(
      Object.entries(endpoint.headers).map(([key, value]) => {
        if (typeof value === 'function') return [key, value()];
        return [key, value];
      })
    );
  }

  return {
    method: endpoint.method,
    headers: {
      ...API_CONFIG.DEFAULT_HEADERS,
      ...endpointHeaders
    },
    ...(data && { body: JSON.stringify(data) })
  };
};

export const apiRequest = async (endpointKey, data = null) => {
  const endpoint = API_CONFIG.ENDPOINTS[endpointKey];
  if (!endpoint) throw new Error(`Unknown endpoint: ${endpointKey}`);

  try {
    const config = getApiConfig(endpointKey, data);
    
    console.log('Making request to:', `${API_CONFIG.BASE_URL}${endpoint.path}`);
    console.log('Request config:', {
      method: config.method,
      headers: config.headers,
      body: config.body ? JSON.parse(config.body) : null
    });

    const response = await fetch(
      `${API_CONFIG.BASE_URL}${endpoint.path}`,
      config
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Full error response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        errorData
      });
      throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpointKey}:`, error);
    throw error;
  }
};