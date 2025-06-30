import { apiRequest } from './api';

const PLACE_TYPES = {
  RESTAURANTS: {
    type: "RESTAURANTS_AND_CAFES",
    criteria: "POPULARITY",
    errorMsg: "ресторанов"
  },
  CINEMAS: {
    type: "CINEMA_AND_CONCERTS", 
    criteria: "POPULARITY",
    errorMsg: "кинотеатров"
  },
  MUSEUMS: {
    type: "PARKS_AND_MUSEUMS",
    criteria: "POPULARITY",
    errorMsg: "музеев"
  },
  STORES: {
    type: "SHOPPING_AND_STORES",
    criteria: "POPULARITY",
    errorMsg: "магазинов"
  },
  HOTELS: {
    type: "HOTELS_AND_HOSTELS",
    criteria: "POPULARITY",
    errorMsg: "отелей"
  }
};

const fetchTopPlace = async (cityId, placeType) => {
  try {
    const { type, criteria } = PLACE_TYPES[placeType];
    
    const response = await apiRequest('TOP_PLACES', {
      type,
      cityId: cityId,
      criteria,
      direction: "DESC"
    });

    if (!Array.isArray(response)) {
      throw new Error('Некорректный формат ответа сервера');
    }

    return response[0] || null;
  } catch (error) {
    console.error(`Failed to load top ${PLACE_TYPES[placeType].errorMsg}:`, error);
    throw new Error(`Не удалось загрузить топ ${PLACE_TYPES[placeType].errorMsg}`);
  }
};

const fetchAllPlaces = async (cityId, placeType) => {
  try {
    const { type, criteria } = PLACE_TYPES[placeType];
    
    const response = await apiRequest('TOP_PLACES', {
      type,
      cityId: cityId,
      criteria,
      direction: "ASC"
    });

    if (!Array.isArray(response)) {
      throw new Error('Некорректный формат ответа сервера');
    }

    return response;
  } catch (error) {
    console.error(`Failed to load ${PLACE_TYPES[placeType].errorMsg}:`, error);
    throw new Error(`Не удалось загрузить ${PLACE_TYPES[placeType].errorMsg}`);
  }
};
const fetchOrganizationReviews = async (organizationId, sort = "POPULARITY", direction = "ASC") => {
  try {
    const response = await apiRequest('REVIEWS', {
      organizationId,
      sort,
      direction
    });

    if (!Array.isArray(response)) {
      throw new Error('Некорректный формат ответа сервера');
    }

    return response;
  } catch (error) {
    console.error('Failed to load reviews:', error);
    throw new Error('Не удалось загрузить отзывы');
  }
};

export const OrganizationService = {
  getTopRestaurant: cityId => fetchTopPlace(cityId, 'RESTAURANTS'),
  getTopCinema: cityId => fetchTopPlace(cityId, 'CINEMAS'),
  getTopMuseum: cityId => fetchTopPlace(cityId, 'MUSEUMS'),
  getAllRestaurants: cityId => fetchAllPlaces(cityId, 'RESTAURANTS'),
  getAllCinemas: cityId => fetchAllPlaces(cityId, 'CINEMAS'),
  getAllMuseums: cityId => fetchAllPlaces(cityId, 'MUSEUMS'),
  getAllStores: cityId => fetchAllPlaces(cityId, 'STORES'),
  getAllHotels: cityId => fetchAllPlaces(cityId, 'HOTELS'),
  getReviews: fetchOrganizationReviews 
};