import { Button, Form, Input, Modal, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Title } = Typography;

export const RegisterForm = ({ visible, onCancel, onLoginClick }) => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Received values of form: ', values);
    // Здесь будет логика регистрации
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
            name="name"
            rules={[
              {
                required: true,
                message: 'Пожалуйста, введите ваше имя!',
              },
            ]}
          >
            <Input placeholder="Имя" size="large" />
          </Form.Item>

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
            <Button type="primary" htmlType="submit" block size="large">
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