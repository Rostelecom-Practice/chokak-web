import React from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Rate, 
  Tag, 
  Avatar,
  Spin
} from 'antd';
import { 
  EnvironmentOutlined, 
  ArrowLeftOutlined,
  FormOutlined,
  UserOutlined,
  StarOutlined,
  StarFilled
} from '@ant-design/icons';
import '../MainPage.css';

const { Title, Text, Paragraph } = Typography;

export const OrganizationDetails = ({
  selectedOrganization,
  handleBackToList,
  user,
  showReviewModal,
  reviews,
  loadingReviews
}) => {
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
                <Text type="secondary" className="organization-address-item">
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