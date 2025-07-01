import React, { useState, useEffect } from 'react';
import { Card, Avatar, Typography, Rate, Spin, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { apiRequest } from '../../api/api';
import '../MainPage.css';

const { Text } = Typography;

export const UserReviews = ({ visible }) => {
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
        <div className="reviews-list-container">
          {reviews.map(review => (
            <Card 
              key={review.id} 
              className="user-review-object"
            >
              <div className="review-card-content">
                <div className="review-card-header">
                  <Avatar icon={<UserOutlined />} className="review-user-avatar" />
                  <div className="review-meta-info">
                    <Text strong className="review-card-title">{review.title}</Text>
                    <div className="review-rating-date">
                      <Rate disabled value={review.rating} className="review-rate" />
                      <Text type="secondary" className="review-date">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Text>
                    </div>
                    {organizations[review.organizationId] && (
                      <div className="review-organization-info">
                        <Text strong type="secondary" className="my-review-organization">
                          {organizations[review.organizationId].name}
                        </Text>
                        <Text type="secondary" className="organization-address">
                          ({organizations[review.organizationId].address})
                        </Text>
                      </div>
                    )}
                  </div>
                </div>
                <div className="review-card-body">
                  <Text className="review-text-content">{review.content}</Text>
                </div>
              </div>
            </Card>
          ))}
        </div>
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