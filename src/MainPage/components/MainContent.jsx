import React from 'react';
import { Row, Col, Card, Spin } from 'antd';
import { Meta } from 'antd/es/list/Item';
import { SearchSection } from './SearchSection';
import { Categories } from './Categories';
import { UserReviews } from './UserReviews';
import { OrganizationsList } from './OrganizationsList';
import '../MainPage.css';

export const MainContent = ({
  selectedOrganization,
  searchQuery,
  setSearchQuery,
  handleSearch,
  isSearching,
  loadOrganizations,
  showUserReviews,
  activeList,
  selectedCity,
  searchResults,
  loadingOrganizations,
  organizationsList,
  getOrganizationTypeName,
  handleOrganizationClick,
  imageCards
}) => {
  if (selectedOrganization) return null;

  return (
    <>
      <SearchSection 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        isSearching={isSearching}
      />
      
      <Categories loadOrganizations={loadOrganizations} />
      
      {showUserReviews ? (
        <UserReviews visible={showUserReviews} />
      ) : activeList === 'search' ? (
        <OrganizationsList
          title={`Результаты поиска "${searchQuery}" в городе ${selectedCity?.label}`}
          items={searchResults}
          loading={isSearching}
          handleOrganizationClick={handleOrganizationClick}
        />
      ) : loadingOrganizations ? (
        <div className="organizations-loading">
          <Spin size="large" />
        </div>
      ) : organizationsList.length > 0 ? (
        <OrganizationsList
          title={`${getOrganizationTypeName(activeList)} в городе ${selectedCity?.label}`}
          items={organizationsList}
          loading={loadingOrganizations}
          handleOrganizationClick={handleOrganizationClick}
        />
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
                <div className="card-content">
                    <h3 className="card-title">{card.title}</h3>
                    <p className="card-description">{card.description}</p>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </>
  );
};