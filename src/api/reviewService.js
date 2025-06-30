import { apiRequest } from './api';

export const ReviewService = {
  /**
   * Отправляет новый отзыв
   * @param {Object} params - Параметры отзыва
   * @param {string} params.sourceId - ID источника
   * @param {string} params.organizationId - ID организации
   * @param {string} params.authorId - ID автора
   * @param {string} params.title - Заголовок отзыва
   * @param {string} params.content - Текст отзыва
   * @param {number} params.rating - Оценка (1-5)
   * @returns {Promise<{reviewId: string, sourceId: string}>}
   */
  async submitReview({
    sourceId,
    organizationId,
    title,
    content,
    rating
  }) {
    console.log('[ReviewService] Начало отправки отзыва', {
      sourceId,
      organizationId,
      title,
      content,
      rating
    });

    const requestBody = {
      sourceId,
      organizationId,
      title,
      content,
      rating: {
        value: rating,
        valueBase5: rating
      }
    };

    console.log('[ReviewService] Сформированное тело запроса:', JSON.stringify(requestBody, null, 2));

    try {
      console.log('[ReviewService] Отправка запроса на сервер...');
      const response = await apiRequest('SUBMIT_REVIEW', requestBody);
      
      console.log('[ReviewService] Успешный ответ от сервера:', JSON.stringify(response, null, 2));
      
      return response;
    } catch (error) {
      console.error('[ReviewService] Ошибка при отправке отзыва:', {
        error: error.message,
        stack: error.stack,
        requestBody
      });
      throw error;
    }
  },

  /**
   * Формирует тело запроса для отправки отзыва
   * (Можно использовать отдельно, если нужно получить только тело без отправки)
   * @param {Object} params - Параметры отзыва
   * @returns {Object} Тело запроса
   */
  buildReviewRequestBody({
    sourceId,
    organizationId,
    title,
    content,
    rating
  }) {
    console.log('[ReviewService] Формирование тела запроса:', {
      sourceId,
      organizationId,
      title,
      content,
      rating
    });

    const requestBody = {
      sourceId,
      organizationId,
      title,
      content,
      rating: {
        value: rating,
        valueBase5: rating
      }
    };

    console.log('[ReviewService] Сформированное тело:', JSON.stringify(requestBody, null, 2));
    
    return requestBody;
  }
};