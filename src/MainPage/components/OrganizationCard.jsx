import React from 'react';
import { Card, Typography, Rate, Tag, Button } from 'antd';
import { StarFilled, EnvironmentOutlined } from '@ant-design/icons';
import '../MainPage.css';
const { Title, Text } = Typography;

export const OrganizationCard = ({ 
  item, 
  handleOrganizationClick 
}) => {
  return (
    <Card
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
          <Text type="secondary" className="organization-address-item">
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
  );
};