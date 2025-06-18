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
  Spin,
  Avatar,
  Menu,
  message,
  Rate,
  Tag,
  Skeleton
} from 'antd';
import { 
  SearchOutlined, 
  UserOutlined, 
  LoginOutlined, 
  EnvironmentOutlined, 
  DownOutlined,
  StarOutlined,
  StarFilled 
} from '@ant-design/icons';
import { CityService } from '../api/cityService';
import { OrganizationService } from '../api/organizationService';
import { LoginForm } from '../LoginForm/LoginForm';
import { RegisterForm } from '../RegisterForm/RegisterForm';
import { auth } from '../firebase/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './MainPage.css';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Meta } = Card;

const categories = [
  'Рестораны и кафе',
  'Кино и концерты',
  'Парки и музеи',
  'Шоппинг и магазины',
  'Отели и хостелы'
];

const CARD_HEIGHT = 320;
const IMAGE_HEIGHT = 240;

export const MainPage = () => {
  const [loginVisible, setLoginVisible] = useState(false);
  const [registerVisible, setRegisterVisible] = useState(false);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [user, setUser] = useState(null);
  const [topPlaces, setTopPlaces] = useState({
    restaurant: null,
    cinema: null,
    museum: null
  });
  const [loadingCards, setLoadingCards] = useState({
    restaurant: false,
    cinema: false,
    museum: false
  });
  const [activeList, setActiveList] = useState(null);
  const [organizationsList, setOrganizationsList] = useState([]);
  const [loadingOrganizations, setLoadingOrganizations] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const loadCities = async () => {
      try {
        const citiesData = await CityService.getCities();
        const formattedCities = citiesData.map(city => ({
          key: city.id.toString(),
          label: city.name
        }));
        setCities(formattedCities);
        if (formattedCities.length > 0) {
          setSelectedCity(formattedCities[0]);
        }
      } catch (err) {
        console.error('City loading error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCities();

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedCity) {
      loadAllTopPlaces();
    }
  }, [selectedCity]);

  const loadAllTopPlaces = async () => {
    setLoadingCards({
      restaurant: true,
      cinema: true,
      museum: true
    });

    try {
      const results = await Promise.allSettled([
        OrganizationService.getTopRestaurant(parseInt(selectedCity.key)),
        OrganizationService.getTopCinema(parseInt(selectedCity.key)),
        OrganizationService.getTopMuseum(parseInt(selectedCity.key))
      ]);

      setTopPlaces({
        restaurant: results[0].status === 'fulfilled' ? results[0].value : null,
        cinema: results[1].status === 'fulfilled' ? results[1].value : null,
        museum: results[2].status === 'fulfilled' ? results[2].value : null
      });

      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Error loading ${['restaurant', 'cinema', 'museum'][index]}:`, result.reason);
        }
      });
    } catch (error) {
      console.error('Error loading top places:', error);
      message.error('Ошибка при загрузке данных');
    } finally {
      setLoadingCards({
        restaurant: false,
        cinema: false,
        museum: false
      });
    }
  };

  const loadOrganizations = async (type) => {
    if (!selectedCity) return;
    
    setLoadingOrganizations(true);
    setActiveList(type);
    
    try {
      let data;
      switch(type) {
        case 'restaurants':
          data = await OrganizationService.getAllRestaurants(parseInt(selectedCity.key));
          break;
        case 'cinemas':
          data = await OrganizationService.getAllCinemas(parseInt(selectedCity.key));
          break;
        case 'museums':
          data = await OrganizationService.getAllMuseums(parseInt(selectedCity.key));
          break;
        case 'stores':
          data = await OrganizationService.getAllStores(parseInt(selectedCity.key));
          break;
        case 'hotels':
          data = await OrganizationService.getAllHotels(parseInt(selectedCity.key));
          break;
        default:
          return;
      }
      
      setOrganizationsList(data);
    } catch (error) {
      console.error(`Error loading ${type}:`, error);
      message.error(`Не удалось загрузить ${getOrganizationTypeName(type)}`);
    } finally {
      setLoadingOrganizations(false);
    }
  };

  const getOrganizationTypeName = (type) => {
    switch(type) {
      case 'restaurants': return 'рестораны и кафе';
      case 'cinemas': return 'кинотеатры и концерты';
      case 'museums': return 'парки и музеи';
      case 'stores': return 'магазины';
      case 'hotels': return 'отели и хостелы';
      default: return 'организации';
    }
  };

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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      message.success('Вы успешно вышли из системы');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      message.error('Не удалось выйти из системы');
    }
  };

  const profileMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Профиль
      </Menu.Item>
      <Menu.Item key="settings" icon={<EnvironmentOutlined />}>
        Настройки
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item 
        key="logout" 
        icon={<LoginOutlined />}
        onClick={handleLogout}
        danger
      >
        Выйти
      </Menu.Item>
    </Menu>
  );

  const imageCards = [
    { 
      title: 'Лучшие рестораны', 
      description: 'Рейтинг 2025',
      imageUrl: topPlaces.restaurant?.imageUrl,
      loading: loadingCards.restaurant
    },
    { 
      title: 'Популярные кинотеатры',
      description: 'Часто посещаемые', 
      imageUrl: topPlaces.cinema?.imageUrl,
      loading: loadingCards.cinema
    },
    { 
      title: 'Топ музеев', 
      description: 'Лучшие музеи города',
      imageUrl: topPlaces.museum?.imageUrl,
      loading: loadingCards.museum
    }
  ];

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
            {user ? (
              <Dropdown menu={profileMenu} trigger={['click']}>
                <div className="profile-dropdown">
                  <Avatar 
                    src={user.photoURL} 
                    icon={<UserOutlined />}
                    className="user-avatar"
                  />
                  <span className="user-name">
                    {user.displayName || user.email.split('@')[0]}
                  </span>
                  <DownOutlined style={{ color: '#fff', marginLeft: 8 }} />
                </div>
              </Dropdown>
            ) : (
              <>
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
              </>
            )}
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
            <Button 
              key={index} 
              className="category-button" 
              type="text" 
              size="large"
              onClick={() => {
                switch(category) {
                  case 'Рестораны и кафе': 
                    loadOrganizations('restaurants');
                    break;
                  case 'Кино и концерты': 
                    loadOrganizations('cinemas');
                    break;
                  case 'Парки и музеи': 
                    loadOrganizations('museums');
                    break;
                  case 'Шоппинг и магазины': 
                    loadOrganizations('stores');
                    break;
                  case 'Отели и хостелы': 
                    loadOrganizations('hotels');
                    break;
                }
              }}
            >
              {category}
            </Button>
          ))}
        </Space>
        
        {loadingOrganizations ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <Spin size="large" />
          </div>
        ) : organizationsList.length > 0 ? (
          <div className="organizations-list-container" style={{ marginTop: 24 }}>
            <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
              {getOrganizationTypeName(activeList)} в {selectedCity?.label}
            </Title>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
              {organizationsList.map(item => (
                <Card
                  key={item.id}
                  hoverable
                  className="organization-card"
                  style={{ width: '100%', maxWidth: '800px' }}
                  styles={{
                    body: { padding: 24 }
                  }}
                  cover={
                    <div className="organization-image-container">
                      {item.imageUrl ? (
                        <img 
                          alt={item.name} 
                          src={item.imageUrl} 
                          className="organization-image"
                        />
                      ) : (
                        <div className="organization-image-placeholder">
                          <div className="organization-image-placeholder-icon"></div>
                        </div>
                      )}
                    </div>
                  }
                >
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Title level={4} style={{ margin: 0 }}>{item.name}</Title>
                        {item.rating > 4.5 && (
                          <Tag icon={<StarFilled />} color="gold">Топ</Tag>
                        )}
                      </div>
                      
                      <div style={{ margin: '12px 0', display: 'flex', alignItems: 'center' }}>
                        <EnvironmentOutlined style={{ marginRight: 8, color: '#888' }} />
                        <Text type="secondary">{item.address}</Text>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Rate 
                          disabled 
                          allowHalf 
                          defaultValue={item.rating} 
                          style={{ fontSize: 16 }} 
                        />
                        <Text style={{ marginLeft: 8 }}>
                          {item.rating.toFixed(1)} ({item.reviewCount} отзывов)
                        </Text>
                      </div>
                    </div>
                    
                    <Button 
                      type="primary" 
                      style={{ marginTop: 16, width: '100%' }}
                      onClick={() => message.info(`Переход к ${item.name}`)}
                    >
                      Подробнее
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Row className="cards-row" gutter={[24, 24]} justify="center">
            {imageCards.map((card, index) => (
              <Col key={index} className="card-col" xs={24} sm={12} md={8} lg={8}>
                <Card
                  className="image-card"
                  hoverable
                  style={{ height: CARD_HEIGHT }}
                  cover={
                    card.loading ? (
                      <div 
                        className="image-placeholder" 
                        style={{ height: IMAGE_HEIGHT }}
                      >
                        <Spin size="large" />
                      </div>
                    ) : card.imageUrl ? (
                      <div 
                        className="image-container"
                        style={{ height: IMAGE_HEIGHT }}
                      >
                        <img 
                          alt={card.title} 
                          src={card.imageUrl}
                          className="card-image"
                        />
                      </div>
                    ) : (
                      <div 
                        className="image-placeholder" 
                        style={{ height: IMAGE_HEIGHT }}
                      >
                        <div className="image-placeholder-text">Картинка {index + 1}</div>
                      </div>
                    )
                  }
                >
                  <Meta 
                    title={card.title} 
                    description={card.description} 
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}

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