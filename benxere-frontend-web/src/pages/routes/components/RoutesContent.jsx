import React from 'react';
import Sidebar from "../../../components/layouts/filter-sidebar";
import Results from "../../../components/Results";

const RoutesContent = ({
  results,
  searching,
  sidebarExpanded,
  setSidebarExpanded,
  priceRange,
  handlePriceChange,
  selectedCompany,
  handleCompanyChange,
  selectedType,
  handleTypeChange,
  uniqueCompanies,
  uniqueBusTypes,
  selectedBus,
  handleDetailClick,
  handleShowSeats,
  handleSectionClick,
  handleCloseDetails,
  showSeats,
  activeSection,
  pickupLocations,
  dropoffLocations,
  loadingLocations
}) => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto py-10">
        <div className="flex gap-6">
          <div className={`transition-all duration-500 ease-in-out ${sidebarExpanded ? 'w-80' : 'w-20'}`}>
            <Sidebar
              priceRange={priceRange}
              handlePriceChange={handlePriceChange}
              selectedCompany={selectedCompany}
              handleCompanyChange={handleCompanyChange}
              selectedType={selectedType}
              handleTypeChange={handleTypeChange}
              isExpanded={sidebarExpanded}
              onToggleExpand={() => setSidebarExpanded(!sidebarExpanded)}
              companies={uniqueCompanies}
              busTypes={uniqueBusTypes}
            />
          </div>

          <div className={`transition-all duration-500 ease-in-out flex-1`}>
            <Results
              results={results}
              selectedBus={selectedBus}
              handleDetailClick={handleDetailClick}
              handleShowSeats={handleShowSeats}
              handleSectionClick={handleSectionClick}
              handleCloseDetails={handleCloseDetails}
              showSeats={showSeats}
              activeSection={activeSection}
              loading={searching}
              pickupLocations={pickupLocations}
              dropoffLocations={dropoffLocations}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutesContent;