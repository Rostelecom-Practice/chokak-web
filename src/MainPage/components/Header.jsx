import React from 'react';
import { Dropdown, Button, Space, Avatar, Tooltip, Spin, Typography } from 'antd';
import { EnvironmentOutlined, UserOutlined, LoginOutlined, DownOutlined, FormOutlined } from '@ant-design/icons';
import '../MainPage.css';
const { Title } = Typography;

export const Header = ({ 
  loading, 
  error, 
  cities, 
  selectedCity, 
  handleCitySelect, 
  user, 
  profileMenuItems, 
  showRegister, 
  showLogin, 
  resetToMainPage 
}) => {
  return (
    <div className="main-header"> 
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
    </div>
  );
};