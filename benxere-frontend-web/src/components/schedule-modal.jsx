import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLocationRecommendations, createLocation } from '../services/location-service';
import { getRouteByOriginAndDestination } from '../services/route-service';
import { loadLocations } from '../utils/load-location';
import CloseIcon from '@mui/icons-material/Close';
import EventIcon from '@mui/icons-material/Event';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Input from './core/form-controls/input';
import Select from './core/form-controls/select';
import SearchableLocationInput from './core/form-controls/searchable-location-input';
import Typography from './core/typography';
import EmployeeSelect from './EmployeeSelect';
import LocationsManager from './LocationsManager';
import '../styles/modal.css';

const ScheduleModal = ({ isOpen, onClose, onSave, schedule, buses = [], drivers = [], assistants = [], secondDrivers = [] }) => {
  const [busId, setBusId] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [driverId, setDriverId] = useState('');
  const [secondDriverId, setSecondDriverId] = useState('');
  const [assistantId, setAssistantId] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [pricePerSeat, setPricePerSeat] = useState('');
  const [numberOfSchedules, setNumberOfSchedules] = useState(1);
  const [pickUpLocationIds, setPickUpLocationIds] = useState([]);
  const [dropOffLocationIds, setDropOffLocationIds] = useState([]);
  const [locations, setLocations] = useState([]);
  const [suggestedLocations, setSuggestedLocations] = useState([]);

  useEffect(() => {
    const fetchSuggestedLocations = async () => {
      try {
        const locations = await getLocationRecommendations("");
        setSuggestedLocations(locations);
      } catch (error) {
        console.error("Lỗi khi lấy gợi ý địa điểm:", error);
      }
    };
  
    fetchSuggestedLocations();
  }, []);
  
  useEffect(() => {
    const fetchLocations = async () => {
      const locationsData = await loadLocations();
      setLocations(locationsData);
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    console.log('Modal opened, isOpen:', isOpen);
    if (isOpen) {
      const fetchLocations = async () => {
        console.log('Fetching locations...');
        try {
          const locations = await getLocationRecommendations("");
          console.log('Raw locations data:', locations);
          setSuggestedLocations(locations);
          console.log('Suggested locations set:', locations);
        } catch (error) {
          console.error("Error fetching locations:", error);
        }
      };
      fetchLocations();
    }
  }, [isOpen]);

  useEffect(() => {
    console.log('Schedule changed:', schedule);
    if (schedule) {
      console.log('Setting form data from schedule:', schedule);
      setBusId(schedule.bus?.busId || '');
      setOrigin(schedule.route?.origin || '');
      setDestination(schedule.route?.destination || '');
      setDriverId(schedule.driver?.userId || '');
      setSecondDriverId(schedule.secondDriver?.userId || '');
      setAssistantId(schedule.assistant?.userId || '');
      setDepartureTime(schedule.departureTime ? new Date(schedule.departureTime).toISOString().slice(0, 16) : '');
      setArrivalTime(schedule.arrivalTime ? new Date(schedule.arrivalTime).toISOString().slice(0, 16) : '');
      setPricePerSeat(schedule.pricePerSeat || '');
      
      console.log('Schedule pickUpLocations:', schedule.pickUpLocations);
      console.log('Schedule dropOffLocations:', schedule.dropOffLocations);
      
      // Ensure we have the location IDs before setting them
      if (schedule.pickUpLocations && Array.isArray(schedule.pickUpLocations)) {
        const pickUpIds = schedule.pickUpLocations.map(loc => {
          console.log('Pick-up location:', loc);
          return loc.locationId;
        });
        console.log('Setting pick-up location IDs:', pickUpIds);
        setPickUpLocationIds(pickUpIds);
      } else {
        console.log('No pick-up locations found in schedule');
        setPickUpLocationIds([]);
      }

      if (schedule.dropOffLocations && Array.isArray(schedule.dropOffLocations)) {
        const dropOffIds = schedule.dropOffLocations.map(loc => {
          console.log('Drop-off location:', loc);
          return loc.locationId;
        });
        console.log('Setting drop-off location IDs:', dropOffIds);
        setDropOffLocationIds(dropOffIds);
      } else {
        console.log('No drop-off locations found in schedule');
        setDropOffLocationIds([]);
      }
    } else {
      console.log('Resetting form');
      resetForm();
    }
  }, [schedule]);

  // Add a new useEffect to log when locationIds change
  useEffect(() => {
    console.log('Pick-up location IDs updated:', pickUpLocationIds);
  }, [pickUpLocationIds]);

  useEffect(() => {
    console.log('Drop-off location IDs updated:', dropOffLocationIds);
  }, [dropOffLocationIds]);

  const resetForm = () => {
    setBusId('');
    setOrigin('');
    setDestination('');
    setDriverId('');
    setSecondDriverId('');
    setAssistantId('');
    setDepartureTime('');
    setArrivalTime('');
    setPricePerSeat('');
    setNumberOfSchedules(1);
    setPickUpLocationIds([]);
    setDropOffLocationIds([]);
  };

  const handleCreateLocation = async (name) => {
    console.log('Creating new location:', name);
    try {
      const newLocation = await createLocation({ name });
      console.log('Created location:', newLocation);
      return newLocation;
    } catch (error) {
      console.error("Error creating location:", error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const route = await getRouteByOriginAndDestination(origin, destination);
      if (!route) {
        alert("Không tìm thấy tuyến đường phù hợp!");
        return;
      }

      if (!driverId || !secondDriverId || !assistantId) {
        alert("Vui lòng chọn tài xế chính, tài xế phụ và phụ xe!");
        return;
      }

      if (driverId === secondDriverId) {
        alert("Tài xế chính và tài xế phụ không thể là cùng một người!");
        return;
      }

      if (pickUpLocationIds.length === 0 || dropOffLocationIds.length === 0) {
        alert("Vui lòng thêm ít nhất một điểm đón và một điểm trả!");
        return;
      }

      // Validate that all IDs are valid numbers
      if (isNaN(parseInt(driverId)) || isNaN(parseInt(secondDriverId)) || isNaN(parseInt(assistantId))) {
        alert("Có lỗi xảy ra với thông tin nhân viên. Vui lòng thử lại!");
        return;
      }

      const scheduleData = {
        busId: parseInt(busId),
        routeId: parseInt(route.routeId),
        driverId: parseInt(driverId),
        secondDriverId: parseInt(secondDriverId),
        assistantId: parseInt(assistantId),
        departureTime: departureTime,
        arrivalTime: arrivalTime,
        pricePerSeat: Number(pricePerSeat),
        pickUpLocationIds,
        dropOffLocationIds
      };

      // Validate the final data before sending
      if (!scheduleData.driverId || !scheduleData.secondDriverId || !scheduleData.assistantId) {
        alert("Có lỗi xảy ra với thông tin nhân viên. Vui lòng thử lại!");
        return;
      }

      console.log("Sending schedule data:", scheduleData);

      if (numberOfSchedules >= 2) {
        await onSave(scheduleData, numberOfSchedules);
      } else {
        await onSave(scheduleData);
      }
      onClose();
    } catch (error) {
      console.error("Lỗi:", error);
      alert("Có lỗi xảy ra khi lưu lịch trình!");
    }
  };

  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ 
            type: "spring", 
            duration: 0.4,
            bounce: 0.1
          }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden border border-slate-200/50"
        >
          {/* Enhanced Header with Gradient */}
          <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-6">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <DirectionsBusIcon className="w-7 h-7" />
                </div>
                <div>
                  <Typography variant="h5" className="font-bold text-white drop-shadow-sm">
                    {schedule ? 'Chỉnh Sửa Lịch Trình' : 'Tạo Lịch Trình Mới'}
                  </Typography>
                  <p className="text-white/80 text-sm mt-1">
                    {schedule ? 'Cập nhật thông tin lịch trình' : 'Thêm lịch trình cho tuyến xe'}
                  </p>
                </div>
              </div>
              <motion.button 
                onClick={onClose} 
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-white/20 rounded-full transition-all duration-200"
              >
                <CloseIcon className="w-6 h-6" />
              </motion.button>
            </div>
          </div>          {/* Enhanced Form with Better Layout */}
          <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(95vh-120px)]">
            <div className="p-8 space-y-8">
              {/* Bus Selection Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200/50"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <DirectionsBusIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Thông tin xe</h3>
                </div>                <Select
                  label="Chọn xe "
                  value={busId}
                  onChange={(e) => setBusId(e.target.value)}
                  className="enhanced-select"
                  required
                  size="medium"
                  options={[
                    { value: '', label: 'Chọn xe cho chuyến đi' },
                    ...buses.map(bus => ({
                      value: bus.busId,
                      label: `🚌 ${bus.busNumber} - ${bus.busType} (${bus.capacity} chỗ)`
                    }))
                  ]}
                />
              </motion.div>

              {/* Route Information Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200/50"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-600 rounded-lg">
                    <LocationOnIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Tuyến đường</h3>
                </div>                <div className="responsive-grid">
                  <div className="relative">
                    <SearchableLocationInput
                      label="Điểm khởi hành"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      className="enhanced-input"
                      required
                      size="medium"
                      fullWidth
                      placeholder="Tìm kiếm điểm khởi hành..."
                      options={locations.map(loc => ({
                        value: loc.value,
                        label: loc.label,
                        description: `Mã: ${loc.value}`,
                        searchTerms: [loc.label, loc.value.toString()]
                      }))}
                      maxSuggestions={8}
                    />
                  </div>
                  <div className="relative">
                    <SearchableLocationInput
                      label="Điểm đến"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="enhanced-input"
                      required
                      size="medium"
                      fullWidth
                      placeholder="Tìm kiếm điểm đến..."
                      options={locations.map(loc => ({
                        value: loc.value,
                        label: loc.label,
                        description: `Mã: ${loc.value}`,
                        searchTerms: [loc.label, loc.value.toString()]
                      }))}
                      maxSuggestions={8}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Time & Price Information Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200/50"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-600 rounded-lg">
                    <EventIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Thời gian & Giá vé</h3>
                </div>                <div className="responsive-grid responsive-grid-4">
                  <Input
                    label="⏰ Giờ xuất phát"
                    type="datetime-local"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="enhanced-input"
                    required
                    size="medium"
                  />
                  <Input
                    label="🏁 Giờ đến"
                    type="datetime-local"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    className="enhanced-input"
                    required
                    size="medium"
                  />
                  <Input
                    label="💰 Giá vé (VNĐ)"
                    type="number"
                    value={pricePerSeat}
                    onChange={(e) => setPricePerSeat(e.target.value)}
                    className="enhanced-input"
                    required
                    size="medium"
                    placeholder="0"
                  />
                  <Input
                    label="📊 Số lịch trình"
                    type="number"
                    value={numberOfSchedules}
                    onChange={(e) => setNumberOfSchedules(Math.max(1, parseInt(e.target.value) || 1))}
                    className="enhanced-input"
                    required
                    size="medium"
                    min="1"
                    placeholder="1"
                  />
                </div>
              </motion.div>

              {/* Staff Assignment Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200/50"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-600 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Phân công nhân viên</h3>
                </div>
                <div className="responsive-grid responsive-grid-3">
                  <EmployeeSelect
                    label="👨‍✈️ Tài xế chính"
                    value={driverId}
                    onChange={(e) => {
                      setDriverId(e.target.value);
                      if (e.target.value === secondDriverId) {
                        setSecondDriverId('');
                      }
                    }}
                    employees={drivers.filter(d => d.userId !== secondDriverId)}
                    placeholder="Chọn tài xế chính"
                    required
                  />
                  <EmployeeSelect
                    label="👨‍✈️ Tài xế phụ"
                    value={secondDriverId}
                    onChange={(e) => {
                      setSecondDriverId(e.target.value);
                      if (e.target.value === driverId) {
                        setDriverId('');
                      }
                    }}
                    employees={secondDrivers.filter(d => d.userId !== driverId)}
                    placeholder="Chọn tài xế phụ"
                    required
                  />
                  <EmployeeSelect
                    label="🎫 Phụ xe"
                    value={assistantId}
                    onChange={(e) => setAssistantId(e.target.value)}
                    employees={assistants}
                    placeholder="Chọn phụ xe"
                    required
                  />
                </div>
              </motion.div>            {/* Điểm đón khách */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-200/50"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-teal-600 rounded-lg">
                  <LocationOnIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">🚏 Điểm đón khách</h3>
              </div>
              <LocationsManager
                title=""
                locationIds={pickUpLocationIds}
                onLocationIdsChange={(ids) => {
                  console.log('Pick-up locations changed:', ids);
                  setPickUpLocationIds(ids);
                }}
                onCreateLocation={handleCreateLocation}
                existingLocations={suggestedLocations}
                buttonColor="green"
              />
            </motion.div>

            {/* Điểm trả khách */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-rose-50 to-red-50 rounded-xl p-6 border border-rose-200/50"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-rose-600 rounded-lg">
                  <LocationOnIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">🏁 Điểm trả khách</h3>
              </div>
              <LocationsManager
                title=""
                locationIds={dropOffLocationIds}
                onLocationIdsChange={(ids) => {
                  console.log('Drop-off locations changed:', ids);
                  setDropOffLocationIds(ids);
                }}
                onCreateLocation={handleCreateLocation}
                existingLocations={suggestedLocations}
                buttonColor="blue"
              />
            </motion.div>
            </div>            {/* Enhanced Footer with Gradient and Better Styling */}
            <div className="enhanced-modal-footer"><div className="footer-buttons">
                <motion.button
                  type="button"
                  onClick={onClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="enhanced-btn-secondary"
                >
                  ❌ Hủy bỏ
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="enhanced-btn-primary"
                >
                  <span className="relative z-10">
                    {schedule ? '✅ Cập nhật' : '🚀 Tạo mới'}
                  </span>
                </motion.button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ScheduleModal;