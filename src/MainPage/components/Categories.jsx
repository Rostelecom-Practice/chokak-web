import React from 'react';
import { Button, Space } from 'antd';
import '../MainPage.css';
const categories = [
  'Рестораны и кафе',
  'Кино и концерты',
  'Парки и музеи',
  'Шоппинг и магазины',
  'Отели и хостелы'
];

export const Categories = ({ loadOrganizations }) => {
  return (
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
  );
};