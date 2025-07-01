import React from 'react';
import { Typography, Spin } from 'antd';
import { OrganizationCard } from './OrganizationCard';
import '../MainPage.css';
const { Title, Text } = Typography;

export const OrganizationsList = ({ 
  title, 
  items, 
  loading, 
  handleOrganizationClick 
}) => {
  if (loading) {
    return (
      <div className="organizations-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="no-results">
        <Text type="secondary">Ничего не найдено</Text>
      </div>
    );
  }

  return (
    <div className="organizations-list-container">
      <Title level={3} className="organizations-list-title">
        {title}
      </Title>
      
      <div className="organizations-list">
        {items.map(item => (
          <OrganizationCard 
            key={item.id}
            item={item}
            handleOrganizationClick={handleOrganizationClick}
          />
        ))}
      </div>
    </div>
  );
};