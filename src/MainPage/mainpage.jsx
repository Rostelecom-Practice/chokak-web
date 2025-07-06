import { useState, useEffect } from 'react';
import { 
  Layout, 
  Spin,
  message,
} from 'antd';
import { 
  LoginOutlined, 
  FormOutlined
} from '@ant-design/icons';
import { CityService } from '../api/cityService';
import { ReviewForm } from '../ReviewForm/ReviewForm';
import { OrganizationService } from '../api/organizationService';
import { LoginForm } from '../LoginForm/LoginForm';
import { RegisterForm } from '../RegisterForm/RegisterForm';
import { auth } from '../firebase/firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../firebase/useAuth';
import { apiRequest } from '../api/api';
import './MainPage.css';
import { Header } from './components/Header';
import { MainContent } from './components/MainContent';
import { OrganizationDetails } from './components/OrganizationDetails';



const { Content } = Layout;

// const CARD_HEIGHT = 320;
// const IMAGE_HEIGHT = 240;

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

  if (authLoading) {
    return (
      <div className="auth-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout className="main-layout">
      <Header
        loading={loading}
        error={error}
        cities={cities}
        selectedCity={selectedCity}
        handleCitySelect={handleCitySelect}
        user={user}
        profileMenuItems={profileMenuItems}
        showRegister={showRegister}
        showLogin={showLogin}
        resetToMainPage={resetToMainPage}
      />
      
      <Content className="main-content">
        {selectedOrganization ? (
          <OrganizationDetails
            selectedOrganization={selectedOrganization}
            handleBackToList={handleBackToList}
            user={user}
            showReviewModal={showReviewModal}
            reviews={reviews}
            loadingReviews={loadingReviews}
          />
        ) : (
          <MainContent
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
            isSearching={isSearching}
            loadOrganizations={loadOrganizations}
            showUserReviews={showUserReviews}
            activeList={activeList}
            selectedCity={selectedCity}
            searchResults={searchResults}
            loadingOrganizations={loadingOrganizations}
            organizationsList={organizationsList}
            getOrganizationTypeName={getOrganizationTypeName}
            handleOrganizationClick={handleOrganizationClick}
            imageCards={imageCards}
          />
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