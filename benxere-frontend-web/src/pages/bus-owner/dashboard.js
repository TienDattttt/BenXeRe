import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from '@headlessui/react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Users, X as XIcon, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from "../../components/layouts/bus-owner/sidebar-layout";
import { getSchedulesByCurrentOwner } from "../../services/bus-owner/bus-owner-api";
import GlobalChatButton from "../../components/chat/global-chat-button";
import { getLocationNameByCode } from '../../utils/load-location';

const generateTimeSlots = () => {
  const slots = [];
  for (let i = 0; i < 24; i++) {
    slots.push(`${i.toString().padStart(2, '0')}:00`);
  }
  return slots;
};

const generateWeekDays = (currentDate) => {
  const days = [];
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    days.push(day);
  }
  return days;
};

const PassengerInfoModal = ({ isOpen, onClose, schedule }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (!schedule) return null;

  // Process the booked seats directly from the schedule object
  const bookedSeats = schedule.seats ? schedule.seats.filter(seat => seat.booked) : [];
  
  // Calculate statistics
  const totalSeats = schedule.seats?.length || 0;
  const occupancyRate = totalSeats > 0 ? (bookedSeats.length / totalSeats) * 100 : 0;

  const handleViewDetails = () => {
    navigate(`/bus-owner/schedule-detail`, { state: { scheduleId: schedule.scheduleId } });
    onClose();
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          </Transition.Child>

          <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex justify-between items-center mb-6">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  Thông tin Chuyến xe {schedule.bus?.busNumber}
                </Dialog.Title>
                <button 
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Route and Time Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium w-24 inline-block">Tuyến đường:</span>
                  <span>{getLocationNameByCode(schedule.route?.origin)} → {getLocationNameByCode(schedule.route?.destination)}</span>
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium w-24 inline-block">Khởi hành:</span>
                  <span>{new Date(schedule.departureTime).toLocaleString('vi-VN')}</span>
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium w-24 inline-block">Đến:</span>
                  <span>{new Date(schedule.arrivalTime).toLocaleString('vi-VN')}</span>
                </p>
              </div>

              {/* Occupancy Stats */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Tỷ lệ đặt chỗ</span>
                  <div className="flex items-center">
                    <div 
                      className={`w-2 h-2 rounded-full mr-2 ${
                        occupancyRate >= 90 ? 'bg-red-500' : 
                        occupancyRate >= 50 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                    />
                    <span className="text-sm font-medium text-gray-900">{occupancyRate.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      occupancyRate >= 90 ? 'bg-red-500' : 
                      occupancyRate >= 50 ? 'bg-yellow-500' : 
                      'bg-green-500'
                    }`}
                    style={{ width: `${occupancyRate}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {bookedSeats.length}/{totalSeats} chỗ đã đặt
                </p>
              </div>

              {/* Passenger List */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Danh sách ghế đã đặt
                </h4>
                {loading ? (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Đang tải thông tin hành khách...</p>
                  </div>
                ) : bookedSeats.length > 0 ? (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {bookedSeats.map((seat) => (
                      <div 
                        key={seat.seatId} 
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Ghế {seat.seatNumber}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {seat.user ? `${seat.user.firstName} ${seat.user.lastName}` : 'Chưa có thông tin'}
                          </p>
                        </div>
                        {seat.user?.phoneNumber && (
                          <a 
                            href={`tel:${seat.user.phoneNumber}`}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            {seat.user.phoneNumber}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">
                      Chưa có hành khách đặt chỗ
                    </p>
                  </div>
                )}
              </div>

              {/* View Details Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleViewDetails}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Xem chi tiết chuyến
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

const ScheduleEvent = ({ schedule, dayStart, dayEnd, onShowPassengers }) => {
  const startTime = new Date(schedule.departureTime);
  const endTime = new Date(schedule.arrivalTime);
  
  // Handle events spanning multiple days
  const displayStart = startTime < dayStart ? dayStart : startTime;
  const displayEnd = endTime > dayEnd ? dayEnd : endTime;
  
  // Calculate position and duration
  const startMinutes = displayStart.getHours() * 60 + displayStart.getMinutes();
  const durationMinutes = (displayEnd - displayStart) / (1000 * 60);
  
  const occupancyRate = schedule.seats ?
    (schedule.seats.filter(s => s.booked).length / schedule.seats.length) * 100 : 0;

  const isMultiDay = startTime.toDateString() !== endTime.toDateString();
  const isContinued = startTime < dayStart || endTime > dayEnd;

  return (
    <div
      className="absolute left-0 right-0 mx-2 rounded-lg bg-blue-500 text-white p-2 overflow-hidden cursor-pointer
                 hover:bg-blue-600 transition-colors group"
      style={{
        top: `${startMinutes}px`,
        height: `${durationMinutes}px`,
        minHeight: '30px',
        zIndex: startTime < dayEnd ? 10 : 1,
        opacity: isContinued ? 0.8 : 1
      }}
      onClick={() => onShowPassengers(schedule)}
      title="Nhấn để xem thông tin hành khách"
    >
      {/* Basic Info - Always Visible */}
      <div className="text-sm font-medium line-clamp-1 flex items-center gap-1">
        <span className="flex-shrink-0">
          {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {!isMultiDay && " - "}
        </span>
        {!isMultiDay && (
          <span className="flex-shrink-0">
            {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
      
      <div className="text-xs line-clamp-1 group-hover:line-clamp-none">
        {getLocationNameByCode(schedule.route?.origin)} → {getLocationNameByCode(schedule.route?.destination)}
        {isMultiDay && (
          <span className="block text-xs opacity-75">
            Kết thúc: {endTime.toLocaleDateString()} {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {/* Status Indicators */}
      <div className="text-xs mt-1 flex items-center gap-2 opacity-90">
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span>{occupancyRate.toFixed(0)}%</span>
        </div>
        {schedule.bus && (
          <span className="bg-blue-400 px-1.5 py-0.5 rounded text-[10px]">
            Xe: {schedule.bus.busNumber}
          </span>
        )}
      </div>

      {/* Continuation Indicators */}
      {startTime < dayStart && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 text-xs">↑</div>
      )}
      {endTime > dayEnd && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs">↓</div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [schedules, setSchedules] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showPassengerInfo, setShowPassengerInfo] = useState(false);
  const [filterBus, setFilterBus] = useState('');
  const [filterRoute, setFilterRoute] = useState('');

  // Get unique buses and routes for filter dropdowns
  const busOptions = Array.from(new Set(schedules.map(s => s.bus?.busNumber).filter(Boolean)));
  const routeOptions = Array.from(new Set(schedules.map(s => {
    const originName = getLocationNameByCode(s.route?.origin);
    const destName = getLocationNameByCode(s.route?.destination);
    return originName && destName ? `${originName} → ${destName}` : null;
  }).filter(Boolean)));

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await getSchedulesByCurrentOwner();
        setSchedules(response || []);
      } catch (error) {
        console.error('Error fetching schedules:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  // Filter schedules by bus and route
  const filteredSchedules = schedules.filter(s => {
    const busMatch = filterBus ? s.bus?.busNumber === filterBus : true;
    const originName = getLocationNameByCode(s.route?.origin);
    const destName = getLocationNameByCode(s.route?.destination);
    const routeString = originName && destName ? `${originName} → ${destName}` : '';
    const routeMatch = filterRoute ? routeString === filterRoute : true;
    return busMatch && routeMatch;
  });

  const handleShowPassengers = (schedule) => {
    setSelectedSchedule(schedule);
    setShowPassengerInfo(true);
  };

  const timeSlots = generateTimeSlots();
  const weekDays = generateWeekDays(currentDate);

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const getSchedulesForDay = (date) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return filteredSchedules.filter(schedule => {
      const startTime = new Date(schedule.departureTime);
      const endTime = new Date(schedule.arrivalTime);
      return (
        (startTime >= dayStart && startTime <= dayEnd) ||
        (endTime >= dayStart && endTime <= dayEnd) ||
        (startTime <= dayStart && endTime >= dayEnd)
      );
    });
  };

  const stats = {
    totalSchedules: schedules.length,
    activeSchedules: schedules.filter(s => s.status === 'ACTIVE').length,
    totalSeats: schedules.reduce((acc, s) => acc + (s.seats?.length || 0), 0),
    occupiedSeats: schedules.reduce((acc, s) => acc + (s.seats?.filter(seat => seat.booked).length || 0), 0),
  };

  return (
    <SidebarLayout>
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Lịch trình chuyến xe</h1>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <CardContent>
                  <div className="flex justify-between items-start">
                    <div>
                      <Typography className="text-sm font-medium text-gray-500">Tổng chuyến</Typography>
                      <Typography className="text-2xl font-bold mt-2">{stats.totalSchedules}</Typography>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <Typography className="text-sm text-gray-600 mt-2">
                    {stats.activeSchedules} đang hoạt động
                  </Typography>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <CardContent>
                  <div className="flex justify-between items-start">
                    <div>
                      <Typography className="text-sm font-medium text-gray-500">Tỷ lệ đặt chỗ</Typography>
                      <Typography className="text-2xl font-bold mt-2">
                        {((stats.occupiedSeats / stats.totalSeats) * 100).toFixed(1)}%
                      </Typography>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <Typography className="text-sm text-gray-600 mt-2">
                    {stats.occupiedSeats}/{stats.totalSeats} chỗ đã đặt
                  </Typography>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4 mb-6 items-center">
            <FormControl size="small" style={{ minWidth: 180 }}>
              <InputLabel id="bus-filter-label">Lọc theo xe</InputLabel>
              <Select
                labelId="bus-filter-label"
                value={filterBus}
                label="Lọc theo xe"
                onChange={e => setFilterBus(e.target.value)}
              >
                <MenuItem value="">Tất cả xe</MenuItem>
                {busOptions.map(bus => (
                  <MenuItem key={bus} value={bus}>{bus}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" style={{ minWidth: 220 }}>
              <InputLabel id="route-filter-label">Lọc theo tuyến đường</InputLabel>
              <Select
                labelId="route-filter-label"
                value={filterRoute}
                label="Lọc theo tuyến đường"
                onChange={e => setFilterRoute(e.target.value)}
              >
                <MenuItem value="">Tất cả tuyến</MenuItem>
                {routeOptions.map(route => (
                  <MenuItem key={route} value={route}>{route}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/* Calendar Container */}
          <div className="bg-white rounded-t-xl shadow-sm border border-gray-200 flex flex-col max-h-[800px]">
            {/* Calendar Header - Fixed */}
            <div className="flex-none">
              <div className="p-4 flex items-center justify-between border-b">
                <div className="flex items-center gap-4">
                  <button
                    onClick={goToPreviousWeek}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={goToNextWeek}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <h2 className="text-lg font-semibold">
                    Tuần {weekDays[0].toLocaleDateString('vi-VN', { month: 'long', day: 'numeric' })} -
                    {weekDays[6].toLocaleDateString('vi-VN', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </h2>
                </div>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  Hôm nay
                </button>
              </div>

              {/* Days Header - Fixed */}
              <div className="flex border-b">
                <div className="w-20 border-r border-gray-200">
                  <div className="h-20"></div>
                </div>
                <div className="flex-1 grid grid-cols-7">
                  {weekDays.map((day, index) => (
                    <div key={index} className="border-r border-gray-200 last:border-r-0">
                      <div className="h-20 p-2">
                        <div className="text-sm font-medium text-gray-500">
                          {day.toLocaleDateString('vi-VN', { weekday: 'short' })}
                        </div>
                        <div className={`text-2xl font-bold ${
                          day.toDateString() === new Date().toDateString()
                            ? 'text-blue-600'
                            : 'text-gray-900'
                        }`}>
                          {day.getDate()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Scrollable Week View */}
            <div className="flex overflow-y-auto" style={{ height: 'calc(100vh - 460px)', minHeight: '600px' }}>
              {/* Time slots */}
              <div className="w-20 border-r border-gray-200">
                {timeSlots.map((time) => (
                  <div
                    key={time}
                    className="h-[60px] border-b border-gray-200 px-2 py-1 text-xs text-gray-500"
                  >
                    {time}
                  </div>
                ))}
              </div>

              {/* Days */}
              <div className="flex-1 grid grid-cols-7">
                {weekDays.map((day, index) => {
                  // Create start and end times for the day
                  const dayStart = new Date(day);
                  dayStart.setHours(0, 0, 0, 0);
                  const dayEnd = new Date(day);
                  dayEnd.setHours(23, 59, 59, 999);
                  
                  return (
                    <div key={index} className="border-r border-gray-200 last:border-r-0">
                      {/* Time slots with better grid */}
                      <div className="relative">
                        {timeSlots.map((time) => (
                          <div
                            key={time}
                            className="h-[60px] border-b border-gray-200 relative bg-white"
                          >
                            {/* Half-hour marker */}
                            <div className="absolute w-full h-[1px] top-[30px] border-t border-gray-100"></div>
                            {/* Full-hour marker */}
                            <div className="absolute w-full h-[1px] top-0 border-t border-gray-200"></div>
                            {/* Current time indicator */}
                            {new Date().toDateString() === day.toDateString() &&
                             time === new Date().getHours().toString().padStart(2, '0') + ':00' && (
                              <div className="absolute w-full h-[2px] bg-red-400 top-[30px] z-20"></div>
                            )}
                          </div>
                        ))}

                        {/* Schedule events */}
                        <div className="absolute inset-0">
                          {getSchedulesForDay(day).map((schedule) => (
                            <ScheduleEvent
                              key={schedule.scheduleId}
                              schedule={schedule}
                              dayStart={dayStart}
                              dayEnd={dayEnd}
                              onShowPassengers={handleShowPassengers}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Add the GlobalChatButton component */}
        <GlobalChatButton />
        
        <PassengerInfoModal 
          isOpen={showPassengerInfo}
          onClose={() => setShowPassengerInfo(false)}
          schedule={selectedSchedule}
        />
      </div>
    </SidebarLayout>
  );
};

export default Dashboard;