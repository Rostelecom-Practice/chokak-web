import { Button, Form, Input, Modal, Typography, message } from 'antd';
import { useState } from 'react';
import { LoginOutlined } from '@ant-design/icons';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";

const { Title } = Typography;

export const LoginForm = ({ visible, onCancel, onRegisterClick }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const { email, password } = values;
      
      // Аутентификация через Firebase
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;
      const idToken = await user.getIdToken();

      // Сохраняем токен в localStorage
      localStorage.setItem("idToken", idToken);
      
      message.success('Вы успешно вошли в систему!');
      form.resetFields();
      onCancel(); // Закрываем модальное окно после успешного входа
    } catch (error) {
      console.error('Ошибка входа:', error);
      message.error('Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      width={400}
      className="auth-modal"
    >
      <div className="auth-form-container">
        <Title level={3} className="auth-title">
          <LoginOutlined /> Вход
        </Title>
        
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              {
                type: 'email',
                message: 'Введите корректный email!',
              },
              {
                required: true,
                message: 'Пожалуйста, введите ваш email!',
              },
            ]}
          >
            <Input placeholder="Email" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: 'Пожалуйста, введите ваш пароль!',
              },
            ]}
          >
            <Input.Password placeholder="Пароль" size="large" />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              size="large"
              loading={loading}
            >
              Войти
            </Button>
          </Form.Item>
        </Form>

        <div className="auth-footer">
          Нет аккаунта?{' '}
          <Button type="link" onClick={onRegisterClick}>
            Зарегистрироваться
          </Button>
        </div>
      </div>
    </Modal>
  );
};