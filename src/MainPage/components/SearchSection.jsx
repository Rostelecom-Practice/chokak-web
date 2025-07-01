import React from 'react';
import { Input, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import '../MainPage.css';
export const SearchSection = ({ 
  searchQuery, 
  setSearchQuery, 
  handleSearch, 
  isSearching 
}) => {
  return (
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
  );
};