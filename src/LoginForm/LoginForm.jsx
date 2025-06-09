import { Button, Form, Input, Modal, Typography } from 'antd';
import { LoginOutlined } from '@ant-design/icons';

const { Title } = Typography;

export const LoginForm = ({ visible, onCancel, onRegisterClick }) => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Received values of form: ', values);
    // Здесь будет логика входа
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
            <Button type="primary" htmlType="submit" block size="large">
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