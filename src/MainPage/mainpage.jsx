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
  Divider,
  List,
  Modal
} from 'antd';
import { 
  SearchOutlined, 
  UserOutlined, 
  LoginOutlined, 
  EnvironmentOutlined, 
  DownOutlined,
  StarFilled,
  StarOutlined,
  ArrowLeftOutlined,
  FormOutlined
} from '@ant-design/icons';
import { CityService } from '../api/cityService';
import { ReviewForm } from '../ReviewForm/ReviewForm';
import { OrganizationService } from '../api/organizationService';
import { LoginForm } from '../LoginForm/LoginForm';
import { RegisterForm } from '../RegisterForm/RegisterForm';
import { auth, loginUser } from '../firebase/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useAuth } from '../firebase/useAuth';
import { apiRequest } from '../api/api';
import './MainPage.css';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
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

const UserReviews = ({ visible }) => {
  const [reviews, setReviews] = useState([]);
  const [organizations, setOrganizations] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingOrganizations, setLoadingOrganizations] = useState(false);

  const fetchOrganizationData = async (id) => {
    try {
      const data = await apiRequest('TOP_PLACES', {
        id,
        criteria: "POPULARITY",
        direction: "ASC"
      });
      return data[0] || null;
    } catch (error) {
      console.error(`Error fetching organization ${id}:`, error);
      return null;
    }
  };

  const loadOrganizationsData = async (reviewsData) => {
    setLoadingOrganizations(true);
    try {
      const orgsData = {};
      
      const orgsPromises = reviewsData.map(review => 
        fetchOrganizationData(review.organizationId)
      );
      
      const orgsResults = await Promise.all(orgsPromises);
      
      reviewsData.forEach((review, index) => {
        if (orgsResults[index]) {
          orgsData[review.organizationId] = orgsResults[index];
        }
      });
      
      setOrganizations(orgsData);
    } catch (error) {
      console.error('Error loading organizations:', error);
    } finally {
      setLoadingOrganizations(false);
    }
  };

  const fetchUserReviews = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('USER_REVIEWS');
      setReviews(data);
      
      if (data && data.length > 0) {
        await loadOrganizationsData(data);
      }
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      message.error('Не удалось загрузить отзывы');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchUserReviews();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Card className="user-reviews-card">
      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : (
        <List
          className="reviews-list-container"
          itemLayout="vertical"
          dataSource={reviews}
          renderItem={review => (
            <List.Item key={review.id} className="review-list-item">
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={<Text strong>{review.title}</Text>}
                description={
                  <>
                    <Rate disabled value={review.rating} className="review-rate" />
                    <Text type="secondary" className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Text>
                    {organizations[review.organizationId] && (
                      <div className="review-organization">
                        <Text strong>
                          {organizations[review.organizationId].name}
                        </Text>
                        <Text type="secondary" className="organization-address">
                          ({organizations[review.organizationId].address})
                        </Text>
                      </div>
                    )}
                  </>
                }
              />
              <Text className="review-content">{review.content}</Text>
            </List.Item>
          )}
        />
      )}
      {loadingOrganizations && (
        <div className="loading-organizations">
          <Spin>
            <div className="loading-text">
              <div>Загрузка данных об организациях...</div>
            </div>
          </Spin>
        </div>
      )}
    </Card>
  );
};

export const MainPage = () => {
  const { user, loading: authLoading, getAuthData } = useAuth();
  const [loginVisible, setLoginVisible] = useState(false);
  const [registerVisible, setRegisterVisible] = useState(false);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
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
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [showUserReviews, setShowUserReviews] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (selectedCity) {
      loadAllTopPlaces();
    }
  }, [selectedCity]);

  const handleLogin = async () => {
    try {
      const authData = await getAuthData();
      if (authData) {
        const { localId, idToken } = authData;
        console.log("Данные пользователя:", { localId, idToken });
        localStorage.setItem("firebaseIdToken", idToken);
        localStorage.setItem("firebaseLocalId", localId);
      }
    } catch (error) {
      console.error("Ошибка:", error);
      message.error("Ошибка получения данных пользователя");
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      handleLogin();
    }
  }, [authLoading, user]);

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

  const handleSearch = async () => {
    if (!searchQuery.trim() || !selectedCity) return;
    
    setIsSearching(true);
    try {
      const data = await apiRequest('TOP_PLACES', {
        cityId: parseInt(selectedCity.key),
        criteria: "POPULARITY"
      });
      
      const filteredResults = data.filter(org => 
        org.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setSearchResults(filteredResults);
      setActiveList('search');
      setOrganizationsList(filteredResults);
      setSelectedOrganization(null);
      setShowUserReviews(false);
    } catch (error) {
      console.error('Search error:', error);
      message.error('Не удалось выполнить поиск');
    } finally {
      setIsSearching(false);
    }
  };

  const loadOrganizations = async (type) => {
    if (!selectedCity) return;
    
    setLoadingOrganizations(true);
    setActiveList(type);
    setSelectedOrganization(null);
    setShowUserReviews(false);
    
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

  const loadOrganizationReviews = async (organizationId) => {
    setLoadingReviews(true);
    try {
      const reviewsData = await OrganizationService.getReviews(organizationId);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
      message.error('Не удалось загрузить отзывы');
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleOrganizationClick = async (organization) => {
    setSelectedOrganization(organization);
    setShowUserReviews(false);
    await loadOrganizationReviews(organization.id);
  };

  const handleBackToList = () => {
    setSelectedOrganization(null);
    setReviews([]);
  };

  const getOrganizationTypeName = (type) => {
    switch(type) {
      case 'restaurants': return 'Рестораны и кафе';
      case 'cinemas': return 'Кинотеатры и концерты';
      case 'museums': return 'Парки и музеи';
      case 'stores': return 'Магазины';
      case 'hotels': return 'Отели и хостелы';
      default: return 'Организации';
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
      localStorage.removeItem("firebaseIdToken");
      localStorage.removeItem("firebaseLocalId");
      message.success('Вы успешно вышли из системы');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      message.error('Не удалось выйти из системы');
    }
  };

  const showReviewModal = () => {
    setReviewModalVisible(true);
  };

  const handleReviewModalCancel = () => {
    setReviewModalVisible(false);
  };

  const resetToMainPage = () => {
    setActiveList(null);
    setOrganizationsList([]);
    setSelectedOrganization(null);
    setReviews([]);
    setShowUserReviews(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const profileMenuItems = [
    {
      key: 'reviews',
      icon: <FormOutlined />,
      label: 'Мои отзывы',
      onClick: () => {
        setShowUserReviews(true);
        setActiveList(null);
        setOrganizationsList([]);
        setSelectedOrganization(null);
        setSearchQuery('');
        setSearchResults([]);
      }
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LoginOutlined />,
      label: 'Выйти',
      danger: true,
      onClick: handleLogout,
    },
  ];

  const imageCards = [
    { 
      title: 'Лучшие рестораны', 
      description: 'Рейтинг 2025',
      imageUrl: topPlaces.restaurant?.imageUrl,
      loading: loadingCards.restaurant,
      onClick: () => loadOrganizations('restaurants')
    },
    { 
      title: 'Популярные кинотеатры',
      description: 'Часто посещаемые', 
      imageUrl: topPlaces.cinema?.imageUrl,
      loading: loadingCards.cinema,
      onClick: () => loadOrganizations('cinemas')
    },
    { 
      title: 'Топ музеев', 
      description: 'Лучшие музеи города',
      imageUrl: topPlaces.museum?.imageUrl,
      loading: loadingCards.museum,
      onClick: () => loadOrganizations('museums')
    }
  ];

  const renderOrganizationDetails = () => {
    if (!selectedOrganization) return null;

    return (
      <div className="organization-details-container">
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={handleBackToList}
          className="back-button"
        >
          Назад к списку
        </Button>

        <div className="organization-details-layout">
          <div className="organization-info-column">
            <Card
              className="organization-details-card"
              cover={
                <div className="organization-image-container">
                  {selectedOrganization.imageUrl ? (
                    <img 
                      alt={selectedOrganization.name} 
                      src={selectedOrganization.imageUrl} 
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
              <div className="organization-details-content">
                <div className="organization-header">
                  <Title level={3} className="organization-name">
                    {selectedOrganization.name}
                  </Title>
                  {selectedOrganization.rating > 4.5 && (
                    <Tag icon={<StarFilled />} color="gold">Топ</Tag>
                  )}
                </div>

                <div className="organization-address-container">
                  <EnvironmentOutlined className="address-icon" />
                  <Text type="secondary" className="organization-address">
                    {selectedOrganization.address}
                  </Text>
                </div>

                <div className="organization-rating-container">
                  <Rate 
                    disabled 
                    allowHalf 
                    defaultValue={selectedOrganization.rating} 
                    className="organization-rating" 
                  />
                  <Text className="rating-text">
                    {selectedOrganization.rating.toFixed(1)} ({selectedOrganization.reviewCount} отзывов)
                  </Text>
                </div>

                <Paragraph className="organization-description">
                  {selectedOrganization.description || 'Описание отсутствует'}
                </Paragraph>
              </div>
            </Card>
          </div>

          <div className="organization-reviews-column">
            <Card className="reviews-card">
              <div className="reviews-header">
                <Title level={4} className="reviews-title">Отзывы</Title>
                {user && (
                  <Button 
                    type="primary" 
                    icon={<FormOutlined />}
                    onClick={showReviewModal}
                    className="details-button"
                  >
                    Добавить отзыв
                  </Button>
                )}
              </div>

              {loadingReviews ? (
                <div className="reviews-loading-container">
                  <Spin size="large" />
                </div>
              ) : (
                <div className="reviews-list-container">
                  {reviews.map(review => (
                    <div key={review.id} className="review-card">
                      <div className="review-card-header">
                        <Avatar icon={<UserOutlined />} className="review-user-avatar" />
                        <div className="review-meta-info">
                          <Text strong className="review-card-title">{review.title}</Text>
                          <Text type="secondary" className="review-post-date">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </Text>
                        </div>
                        {review.rating > 0 && (
                          <Rate 
                            disabled 
                            value={review.rating} 
                            character={<StarOutlined />} 
                            className="review-rating-stars" 
                          />
                        )}
                      </div>
                      <div className="review-card-body">
                        <Text className="review-text-content">{review.content}</Text>
                      </div>
                    </div>
                  ))}
                </div>
              )}  
            </Card>
          </div>
        </div>
      </div>
    );
  };

  if (authLoading) {
    return (
      <div className="auth-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout className="main-layout">
      <Header className="main-header">
        <div className="header-content">
          <div className="header-center">
            <Title 
              level={1} 
              className="page-title"
              onClick={resetToMainPage}
              style={{ cursor: 'pointer' }}
            >
              Chokak 0_o
            </Title>
          </div>
          
          <div className="header-right">
            {loading ? (
              <Spin size="small" className="city-loading" />
            ) : error ? (
              <Tooltip title={error}>
                <Button icon={<EnvironmentOutlined />} className="city-button" danger>
                  {selectedCity?.label || 'Город'}
                </Button>
              </Tooltip>
            ) : (
              <Dropdown
                overlayClassName="city-dropdown-menu"
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
            
            <Space className="header-actions">
              {user ? (
                <Dropdown
                  overlayClassName="user-dropdown-menu"
                  menu={{ items: profileMenuItems }}
                  trigger={['click']}
                  placement="bottomRight"
                >
                  <div className="profile-dropdown">
                    <Avatar 
                      src={user.photoURL} 
                      icon={!user.photoURL && <UserOutlined />}
                      className="user-avatar"
                    />
                    <span className="user-name">
                      {user.displayName || (user.email ? user.email.split('@')[0] : 'Профиль')}
                    </span>
                    <DownOutlined className="dropdown-icon" />
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
        </div>
      </Header>
      
      <Content className="main-content">
        {selectedOrganization ? (
          renderOrganizationDetails()
        ) : (
          <>
            <div className="search-container">
              <Input 
                className="search-input"
                size="large"
                placeholder="Поиск..." 
                prefix={<SearchOutlined />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onPressEnter={handleSearch}
              />
              <Button 
                className="search-button" 
                type="primary" 
                size="large" 
                icon={<SearchOutlined />}
                onClick={handleSearch}
                loading={isSearching}
              >
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
            
            {showUserReviews ? (
              <UserReviews visible={showUserReviews} />
            ) : activeList === 'search' ? (
              <div className="organizations-list-container">
                <Title level={3} className="organizations-list-title">
                  Результаты поиска "{searchQuery}" в городе {selectedCity?.label}
                </Title>
                
                {searchResults.length > 0 ? (
                  <div className="organizations-list">
                    {searchResults.map(item => (
                      <Card
                        key={item.id}
                        hoverable
                        className="organization-card"
                        onClick={() => handleOrganizationClick(item)}
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
                        <div className="organization-content">
                          <div className="organization-header">
                            <Title level={4} className="organization-name">
                              {item.name}
                            </Title>
                            {item.rating > 4.5 && (
                              <Tag icon={<StarFilled />} color="gold">Топ</Tag>
                            )}
                          </div>
                          
                          <div className="organization-address-container">
                            <EnvironmentOutlined className="address-icon" />
                            <Text type="secondary" className="organization-address">
                              {item.address}
                            </Text>
                          </div>
                          
                          <div className="organization-rating-container">
                            <Rate 
                              disabled 
                              allowHalf 
                              defaultValue={item.rating} 
                              className="organization-rating" 
                            />
                            <Text className="rating-text">
                              {item.rating.toFixed(1)} ({item.reviewCount} отзывов)
                            </Text>
                          </div>
                          
                          <Button 
                            type="primary" 
                            className="details-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOrganizationClick(item);
                            }}
                          >
                            Подробнее
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="no-results">
                    <Text type="secondary">Ничего не найдено</Text>
                  </div>
                )}
              </div>
            ) : loadingOrganizations ? (
              <div className="organizations-loading">
                <Spin size="large" />
              </div>
            ) : organizationsList.length > 0 ? (
              <div className="organizations-list-container">
                <Title level={3} className="organizations-list-title">
                  {getOrganizationTypeName(activeList)} в городе {selectedCity?.label}
                </Title>
                
                <div className="organizations-list">
                  {organizationsList.map(item => (
                    <Card
                      key={item.id}
                      hoverable
                      className="organization-card"
                      onClick={() => handleOrganizationClick(item)}
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
                      <div className="organization-content">
                        <div className="organization-header">
                          <Title level={4} className="organization-name">
                            {item.name}
                          </Title>
                          {item.rating > 4.5 && (
                            <Tag icon={<StarFilled />} color="gold">Топ</Tag>
                          )}
                        </div>
                        
                        <div className="organization-address-container">
                          <EnvironmentOutlined className="address-icon" />
                          <Text type="secondary" className="organization-address">
                            {item.address}
                          </Text>
                        </div>
                        
                        <div className="organization-rating-container">
                          <Rate 
                            disabled 
                            allowHalf 
                            defaultValue={item.rating} 
                            className="organization-rating" 
                          />
                          <Text className="rating-text">
                            {item.rating.toFixed(1)} ({item.reviewCount} отзывов)
                          </Text>
                        </div>
                        
                        <Button 
                          type="primary" 
                          className="details-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOrganizationClick(item);
                          }}
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
                      onClick={card.onClick}
                      cover={
                        card.loading ? (
                          <div className="image-placeholder">
                            <Spin size="large" />
                          </div>
                        ) : card.imageUrl ? (
                          <div className="image-container">
                            <img 
                              alt={card.title} 
                              src={card.imageUrl}
                              className="card-image"
                            />
                          </div>
                        ) : (
                          <div className="image-placeholder">
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
          </>
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

        {selectedOrganization && (
          <ReviewForm
            visible={reviewModalVisible}
            onCancel={handleReviewModalCancel}
            organizationId={selectedOrganization.id}
            userId={user?.uid}
            onSuccess={(result) => {
              loadOrganizationReviews(selectedOrganization.id);
            }}
          />
        )}
      </Content>
    </Layout>
  );
};