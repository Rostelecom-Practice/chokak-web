import { useState, useEffect } from 'react';
import { 
  Layout, 
  Input, 
  Button, 
  Row, 
  Col, 
  Card, 
  Typography, 
  Space, 
  Dropdown,
  Tooltip,
  Spin
} from 'antd';
import { 
  SearchOutlined, 
  UserOutlined, 
  LoginOutlined, 
  EnvironmentOutlined, 
  DownOutlined 
} from '@ant-design/icons';
import { CityService } from '../api/cityService';
import { LoginForm } from '../LoginForm/LoginForm';
import { RegisterForm } from '../RegisterForm/RegisterForm';
import './MainPage.css';

const { Header, Content } = Layout;
const { Title } = Typography;
const { Meta } = Card;

const categories = [
  'Рестораны и кафе',
  'Кино и концерты',
  'Парки и музеи',
  'Шоппинг и магазины',
  'Отели и хостелы'
];

const imageCards = [
  { title: 'Лучшие рестораны', description: 'Рейтинг 2025' },
  { title: 'Популярные кинотеатры', description: 'Выбор пользователей' },
  { title: 'Топ музеев', description: 'По оценкам посетителей' }
];

export const MainPage = () => {
  const [loginVisible, setLoginVisible] = useState(false);
  const [registerVisible, setRegisterVisible] = useState(false);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  useEffect(() => {
    const loadCities = async () => {
      try {
        const citiesData = await CityService.getCities();
        
        setCities(citiesData);
        setSelectedCity(citiesData[0]);
      } catch (err) {
        console.error('City loading error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCities();
  }, []);

  const handleCitySelect = ({ key }) => {
    const city = cities.find(c => c.key === key);
    if (city) {
      setSelectedCity(city);
    }
  };

  const showLogin = () => {
    setLoginVisible(true);
    setRegisterVisible(false);
  };

  const showRegister = () => {
    setRegisterVisible(true);
    setLoginVisible(false);
  };

  const handleCancel = () => {
    setLoginVisible(false);
    setRegisterVisible(false);
  };

  return (
    <Layout className="main-layout">
      <Header className="main-header">
        <div className="header-content">
          <div className="header-left">
            <Title level={2} className="page-title">Chokak 0_o</Title>
            
            {loading ? (
              <Spin size="small" />
            ) : error ? (
              <Tooltip title={error}>
                <Button icon={<EnvironmentOutlined />} className="city-button" danger>
                  {selectedCity?.label || 'Город'}
                </Button>
              </Tooltip>
            ) : (
              <Dropdown
                menu={{
                  items: cities,
                  onClick: handleCitySelect,
                }}
                placement="bottomRight"
                trigger={['click']}
                disabled={cities.length === 0}
              >
                <Button icon={<EnvironmentOutlined />} className="city-button">
                  {selectedCity?.label || 'Выберите город'} <DownOutlined />
                </Button>
              </Dropdown>
            )}
          </div>
          
          <Space className="header-actions">
            <Button 
              type="text" 
              icon={<UserOutlined />} 
              className="auth-button"
              onClick={showRegister}
            >
              Регистрация
            </Button>
            <Button 
              type="text" 
              icon={<LoginOutlined />} 
              className="auth-button"
              onClick={showLogin}
            >
              Вход
            </Button>
          </Space>
        </div>
      </Header>
      
      <Content className="main-content">
        <div className="search-container">
          <Input 
            className="search-input"
            size="large"
            placeholder="Поиск..." 
            prefix={<SearchOutlined />}
          />
          <Button className="search-button" type="primary" size="large" icon={<SearchOutlined />}>
            Поиск
          </Button>
        </div>
        
        <Space className="categories-container">
          {categories.map((category, index) => (
            <Button key={index} className="category-button" type="text" size="large">
              {category}
            </Button>
          ))}
        </Space>
        
        <Row className="cards-row" gutter={[24, 24]} justify="center">
          {imageCards.map((card, index) => (
            <Col key={index} className="card-col" xs={24} sm={12} md={8} lg={7}>
              <Card
                className="image-card"
                hoverable
                cover={
                  <div className="image-placeholder">
                    <div className="image-placeholder-text">Картинка {index + 1}</div>
                  </div>
                }
              >
                <Meta title={card.title} description={card.description} />
              </Card>
            </Col>
          ))}
        </Row>

        <LoginForm 
          visible={loginVisible} 
          onCancel={handleCancel} 
          onRegisterClick={showRegister}
        />
        
        <RegisterForm 
          visible={registerVisible} 
          onCancel={handleCancel} 
          onLoginClick={showLogin}
        />
      </Content>
    </Layout>
  );
};