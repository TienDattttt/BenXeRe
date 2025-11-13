import React, { useState, useEffect, useContext, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { parse, format } from 'date-fns';

import { getLocations, CommonDispatchContext } from "../../contexts/common";
import { getSchedulesByOriginAndDestinationAndDate } from '../../services/schedule-service';
import { getPickUpSchedules, getDropOffSchedules } from '../../services/location-service';
import { loadLocations } from "../../utils/load-location";

import HeroLayout from "../../components/layouts/hero-layout";
import LoadingState from "./components/LoadingState";
import RoutesContent from "./components/RoutesContent";

import { searchSchema } from "./components/routesConstants";

const RoutesPage = () => {
  const dispatch = useContext(CommonDispatchContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
    const [allResults, setAllResults] = useState([]); // Store all unfiltered results
  const [selectedBus, setSelectedBus] = useState(null);
  const [showSeats, setShowSeats] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500000000 });
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [uniqueCompanies, setUniqueCompanies] = useState([]);
  const [uniqueBusTypes, setUniqueBusTypes] = useState([]);
  const [pickupLocations, setPickupLocations] = useState([]);
  const [dropoffLocations, setDropoffLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Filtered results based on current filter settings
  const filteredResults = useMemo(() => {
    return allResults.filter(item => {
      const itemPrice = item.pricePerSeat || 0;
      const minPrice = priceRange.min || 0;
      const maxPrice = priceRange.max || 500000;
      const meetsPrice = itemPrice >= minPrice && itemPrice <= maxPrice;
      
      const meetsCompany = !selectedCompany || item.bus.companyName === selectedCompany;
      const meetsType = !selectedType || item.bus.busType === selectedType;
      return meetsPrice && meetsCompany && meetsType;
    });
  }, [allResults, priceRange, selectedCompany, selectedType]);

  useEffect(() => {
    const initLocations = async () => {
      setLoading(true);
      try {
        await getLocations(dispatch);
      } catch (error) {
        console.error('Error initializing locations:', error);
      } finally {
        setLoading(false);
      }
    };
    initLocations();
  }, [dispatch]);

  // Fetch pickup and dropoff locations when selectedBus changes
  useEffect(() => {
    const fetchPickupDropoffLocations = async () => {
      if (!selectedBus || !selectedBus.scheduleId) return;
      
      setLoadingLocations(true);
      try {
        const [pickupData, dropoffData] = await Promise.all([
          getPickUpSchedules(selectedBus.scheduleId),
          getDropOffSchedules(selectedBus.scheduleId)
        ]);
        
        console.log('Fetched pickup locations:', pickupData);
        console.log('Fetched dropoff locations:', dropoffData);
        
        setPickupLocations(pickupData || []);
        setDropoffLocations(dropoffData || []);
      } catch (error) {
        console.error('Error fetching pickup/dropoff locations:', error);
        setPickupLocations([]);
        setDropoffLocations([]);
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchPickupDropoffLocations();
  }, [selectedBus]);
  useEffect(() => {
    const fetchSchedules = async () => {
      const from = searchParams.get('originCode');
      const to = searchParams.get('destinationCode');
      const date = searchParams.get('date');

      if (from && to && date) {
        setSearching(true);
        setAllResults([]);
        try {
          // const parsedDate = parse(date, 'dd-MM-yyyy', new Date());
          // const formattedDate = format(parsedDate, 'dd-MM-yyyy');
          // const data = await getSchedulesByOriginAndDestinationAndDate(from, to, formattedDate);
          const data = await getSchedulesByOriginAndDestinationAndDate(from, to, date);
          setAllResults(data);
          
          const companies = [...new Set(data.map(item => item.bus.companyName))];
          const busTypes = [...new Set(data.map(item => item.bus.busType))];
          setUniqueCompanies(companies);
          setUniqueBusTypes(busTypes);
        } catch (error) {
          console.error('Error fetching schedules:', error);
        } finally {
          setSearching(false);
        }
      }
    };

    fetchSchedules();
  }, [searchParams]);

  const locationOptions = loadLocations();
  const handleSearch = async (values) => {
    setSearching(true);
    setAllResults([]);
    setSelectedBus(null);
    setShowSeats(false);
    setActiveSection(null);
    setPickupLocations([]);
    setDropoffLocations([]);
    
    const { from, to, date } = values;
    navigate({
      pathname: "/routes",
      search: `?originCode=${from}&destinationCode=${to}&date=${date}`,
    });

    try {
      const parsedDate = parse(date, 'dd-MM-yyyy', new Date());
      const formattedDate = format(parsedDate, 'dd-MM-yyyy');
      const data = await getSchedulesByOriginAndDestinationAndDate(from, to, formattedDate);

      setAllResults(data);
      
      const companies = [...new Set(data.map(item => item.bus.companyName))];
      const busTypes = [...new Set(data.map(item => item.bus.busType))];
      setUniqueCompanies(companies);
      setUniqueBusTypes(busTypes);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setSearching(false);
    }
  };

  // Event handlers
  const handleDetailClick = (result) => {
    setSelectedBus({
      ...result.bus,
      scheduleId: result.scheduleId,
    });
    setShowSeats(false);
    setActiveSection(null);
  };

  const handleShowSeats = () => {
    setShowSeats(true);
    setActiveSection(null);
  };

  const handleCloseDetails = () => {
    setSelectedBus(null);
    setActiveSection(null);
    setShowSeats(false);
  };

  const handleSectionClick = (section) => {
    setActiveSection(section);
    setShowSeats(false);
  };
  const handlePriceChange = (type, value) => {
    setPriceRange(prev => ({
      ...prev,
      [type]: parseInt(value)
    }));
    // No need to trigger search - filtering happens automatically via useMemo
  };

  const handleCompanyChange = (event) => {
    setSelectedCompany(event.target.value);
    // No need to trigger search - filtering happens automatically via useMemo
  };

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
    // No need to trigger search - filtering happens automatically via useMemo
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <HeroLayout
      locations={locationOptions}
      validationSchema={searchSchema}
      handleSearch={handleSearch}
    >      <RoutesContent 
        results={filteredResults}
        searching={searching}
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
        priceRange={priceRange}
        handlePriceChange={handlePriceChange}
        selectedCompany={selectedCompany}
        handleCompanyChange={handleCompanyChange}
        selectedType={selectedType}
        handleTypeChange={handleTypeChange}
        uniqueCompanies={uniqueCompanies}
        uniqueBusTypes={uniqueBusTypes}
        selectedBus={selectedBus}
        handleDetailClick={handleDetailClick}
        handleShowSeats={handleShowSeats}
        handleSectionClick={handleSectionClick}
        handleCloseDetails={handleCloseDetails}
        showSeats={showSeats}
        activeSection={activeSection}
        pickupLocations={pickupLocations}
        dropoffLocations={dropoffLocations}
        loadingLocations={loadingLocations}
      />
    </HeroLayout>
  );
};

export default RoutesPage;
