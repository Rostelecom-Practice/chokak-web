import { Layout, Input, Button, Row, Col, Card, Typography, Space, Dropdown } from 'antd';
import { 
  SearchOutlined, 
  UserOutlined, 
  LoginOutlined, 
  EnvironmentOutlined, 
  DownOutlined 
} from '@ant-design/icons';
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

const cities = [
  { key: '1', label: 'Москва' },
  { key: '2', label: 'Санкт-Петербург' },
  { key: '3', label: 'Новосибирск' },
  { key: '4', label: 'Екатеринбург' },
  { key: '5', label: 'Казань' }
];

export const MainPage = () => {
  return (
    <Layout className="main-layout">
      <Header className="main-header">
        <div className="header-content">
          <div className="header-left">
            <Title level={2} className="page-title">Chokak 0_o</Title>
            <Dropdown
              menu={{ items: cities }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Button icon={<EnvironmentOutlined />} className="city-button">
                Москва <DownOutlined />
              </Button>
            </Dropdown>
          </div>
          
          <Space className="header-actions">
            <Button type="text" icon={<UserOutlined />} className="auth-button">
              Регистрация
            </Button>
            <Button type="text" icon={<LoginOutlined />} className="auth-button">
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
      </Content>
    </Layout>
  );
};