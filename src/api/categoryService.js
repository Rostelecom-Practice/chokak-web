import { apiRequest } from './api';

// Маппинг имен категорий с сервера на русские названия
const CATEGORY_NAMES_MAP = {
  'RESTAURANTS_AND_CAFES': 'Рестораны и кафе',
  'CINEMA_AND_CONCERTS': 'Кино и концерты',
  'PARKS_AND_MUSEUMS': 'Парки и музеи',
  'SHOPPING_AND_STORES': 'Шоппинг и магазины',
  'HOTELS_AND_HOSTELS': 'Отели и хостелы'
};

export const CategoryService = {
  getCategories: async () => {
    try {
      const categories = await apiRequest('PLACE_CATEGORIES');
      return categories.map(category => ({
        ...category,
        displayName: CATEGORY_NAMES_MAP[category.name] || category.name
      }));
    } catch (error) {
      console.error('Failed to load categories:', error);
      throw new Error('Не удалось загрузить категории');
    }
  }
};