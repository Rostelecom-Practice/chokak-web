import { useState } from 'react';
import { Button, Form, Input, Modal, Typography, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";

const { Title } = Typography;

export const RegisterForm = ({ visible, onCancel, onLoginClick }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const { email, password } = values;
      console.log("email", email);
      console.log("pass", password);
      // Регистрация через Firebase
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      console.log("usercred", userCred);
      const user = userCred.user;
      const idToken = await user.getIdToken();

      // Сохраняем токен в localStorage
      localStorage.setItem("idToken", idToken);
      
      message.success('Регистрация прошла успешно! Вы вошли в систему.');
      form.resetFields();
      onCancel(); // Закрываем модальное окно после успешной регистрации
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      
      let errorMessage = 'Ошибка при регистрации';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Этот email уже используется';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Пароль должен содержать минимум 6 символов';
      }
      
      message.error(errorMessage);
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
          <UserOutlined /> Регистрация
        </Title>
        
        <Form
          form={form}
          name="register"
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
              {
                min: 6,
                message: 'Пароль должен содержать минимум 6 символов',
              },
            ]}
          >
            <Input.Password placeholder="Пароль" size="large" />
          </Form.Item>

          <Form.Item
            name="confirm"
            dependencies={['password']}
            rules={[
              {
                required: true,
                message: 'Пожалуйста, подтвердите пароль!',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Пароли не совпадают!'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Подтвердите пароль" size="large" />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              size="large"
              loading={loading}
            >
              Зарегистрироваться
            </Button>
          </Form.Item>
        </Form>

        <div className="auth-footer">
          Уже есть аккаунт?{' '}
          <Button type="link" onClick={onLoginClick}>
            Войти
          </Button>
        </div>
      </div>
    </Modal>
  );
};