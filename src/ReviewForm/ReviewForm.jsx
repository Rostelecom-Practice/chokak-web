import { useState } from 'react';
import { Form, Input, Button, Rate, Modal, message } from 'antd';
import { ReviewService } from '../api/reviewService';

const { TextArea } = Input;

export const ReviewForm = ({ 
  visible, 
  onCancel, 
  organizationId,
  onSuccess 
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Формируем данные для отправки
      const reviewData = {
        sourceId: "00000000-0000-0000-0000-000000000001", // Можно сделать динамическим
        organizationId: organizationId,
        title: values.title,
        content: values.content,
        rating: values.rating
      };

      // Отправляем отзыв через сервис
      const result = await ReviewService.submitReview(reviewData);
      
      message.success('Отзыв успешно добавлен!');
      onSuccess(result);
      form.resetFields();
      onCancel();
    } catch (error) {
      console.error('Ошибка при отправке отзыва:', error);
      message.error('Не удалось добавить отзыв');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Добавить отзыв"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ rating: 5 }}
      >
        <Form.Item
          name="rating"
          label="Оценка"
          rules={[{ required: true, message: 'Пожалуйста, поставьте оценку' }]}
        >
          <Rate allowHalf />
        </Form.Item>

        <Form.Item
          name="title"
          label="Заголовок отзыва"
          rules={[
            { required: true, message: 'Пожалуйста, введите заголовок' },
            { max: 100, message: 'Максимальная длина 100 символов' }
          ]}
        >
          <Input placeholder="Кратко опишите ваше впечатление" />
        </Form.Item>

        <Form.Item
          name="content"
          label="Текст отзыва"
          rules={[
            { required: true, message: 'Пожалуйста, напишите отзыв' },
            { min: 10, message: 'Минимум 10 символов' },
            { max: 2000, message: 'Максимальная длина 2000 символов' }
          ]}
        >
          <TextArea 
            rows={6} 
            placeholder="Подробно опишите ваши впечатления..." 
            showCount 
            maxLength={2000}
          />
        </Form.Item>

        <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            Отмена
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Отправить отзыв
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};