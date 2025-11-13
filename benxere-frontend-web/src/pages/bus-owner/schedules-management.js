import React, { useState, useEffect, lazy, Suspense, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Sidebar from "../../components/layouts/bus-owner/sidebar";
import {
  getSchedulesByCurrentOwner,
  getBusesByCurrentOwner,
} from "../../services/bus-owner/bus-owner-api";
import {
  createSchedule,
  updateSchedule,
  deleteSchedule,
  createMultipleSchedules
} from "../../services/schedule-service";
import { getMyEmployeesByCurrentOwner } from "../../services/bus-owner/bus-owner-api";
import { getLocationNameByCode } from "../../utils/load-location";
const ScheduleModal = lazy(() => import("../../components/schedule-modal"));
const BusModal = lazy(() => import("../../components/bus-modal"));

const Management = () => {  const [schedules, setSchedules] = useState([]);
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isMultiScheduleModalOpen, setIsMultiScheduleModalOpen] = useState(false);
  const [isBusModalOpen, setIsBusModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedBus, setSelectedBus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");
  const [filterRoute, setFilterRoute] = useState("");
  const [filterBusNumber, setFilterBusNumber] = useState("");
  const [selectedSchedules, setSelectedSchedules] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [viewMode, setViewMode] = useState('table'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [occupancyFilter, setOccupancyFilter] = useState('all'); 
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const scheduleResponse = await getSchedulesByCurrentOwner();
        const busResponse = await getBusesByCurrentOwner();
        const employees = await getMyEmployeesByCurrentOwner();
        const drivers = employees.filter((emp) => emp.role === "DRIVER");
        const assistants = employees.filter(
          (emp) => emp.role === "ASSISTANT_DRIVER"
        );
        setSchedules(scheduleResponse || []);
        setBuses(busResponse || []);
        setDrivers(drivers || []);
        setAssistants(assistants || []);
      } catch (error) {
        console.error(
          "Error fetching data:",
          error.response ? error.response.data : error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveMultipleSchedules = async (schedulesData) => {
    try {
      const formattedSchedules = schedulesData.map(schedule => ({
        ...schedule,
        route: {
          ...schedule.route,
          origin: schedule.route.origin,
          destination: schedule.route.destination
        },
        busId: schedule.busId,
        driverId: schedule.driverId,
        assistantId: schedule.assistantId || null,
        price: Number(schedule.price)
      }));

      const newSchedules = await createMultipleSchedules(formattedSchedules);
      setSchedules((prevSchedules) => [...prevSchedules, ...newSchedules]);
      setIsMultiScheduleModalOpen(false);
    } catch (error) {
      console.error(
        "Error creating multiple schedules:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleSaveSchedule = async (scheduleData, numberOfSchedules = 1) => {
    try {
      if (selectedSchedule) {
        await updateSchedule(selectedSchedule.scheduleId, scheduleData);
        setSchedules((prevSchedules) =>
          prevSchedules.map((sch) =>
            sch.scheduleId === selectedSchedule.scheduleId ? { ...scheduleData, scheduleId: selectedSchedule.scheduleId } : sch
          )
        );
      } else {
        if (numberOfSchedules >= 2) {
          const newSchedules = await createMultipleSchedules(scheduleData, numberOfSchedules);
          setSchedules((prevSchedules) => [...prevSchedules, ...newSchedules]);
        } else {
          const newSchedule = await createSchedule(scheduleData);
          setSchedules((prevSchedules) => [...prevSchedules, newSchedule]);
        }
      }
      setIsScheduleModalOpen(false);
    } catch (error) {
      console.error(
        "Error saving schedule:",
        error.response ? error.response.data : error.message
      );
      
      // Handle specific error messages from the backend
      const errorMessage = error.response?.data?.message || '';
      
      if (errorMessage.includes("Bus is already scheduled")) {
        alert("Không thể lưu lịch trình: Xe đã được phân công cho một lịch trình khác trong khoảng thời gian này.");
      } else if (errorMessage.includes("is already assigned as second driver")) {
        alert("Không thể lưu lịch trình: " + errorMessage);
      } else if (errorMessage.includes("is already assigned as driver")) {
        alert("Không thể lưu lịch trình: " + errorMessage);
      } else if (errorMessage.includes("is already assigned to another schedule")) {
        alert("Không thể lưu lịch trình: " + errorMessage);
      } else {
        alert("Có lỗi xảy ra khi lưu lịch trình!");
      }
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      await deleteSchedule(scheduleId);
      setSchedules((prevSchedules) => prevSchedules.filter(
        (schedule) => schedule.scheduleId !== scheduleId
      ));
    } catch (error) {
      console.error(
        "Error deleting schedule:",
        error.response ? error.response.data : error.message
      );
      alert("Có lỗi xảy ra khi xóa lịch trình!");
    }
  };

  const handleDeleteMultipleSchedules = async () => {
    if (selectedSchedules.length === 0) return;
    
    setDeleteInProgress(true);
    
    try {
      for (const scheduleId of selectedSchedules) {
        await deleteSchedule(scheduleId);
      }
      
      setSchedules((prevSchedules) => 
        prevSchedules.filter((schedule) => !selectedSchedules.includes(schedule.scheduleId))
      );
      
      setSelectedSchedules([]);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error(
        "Error deleting multiple schedules:",
        error.response ? error.response.data : error.message
      );
      alert("Có lỗi xảy ra khi xóa các lịch trình!");
    } finally {
      setDeleteInProgress(false);
    }
  };

  const toggleScheduleSelection = (scheduleId) => {
    setSelectedSchedules(prevSelected => {
      if (prevSelected.includes(scheduleId)) {
        return prevSelected.filter(id => id !== scheduleId);
      } else {
        return [...prevSelected, scheduleId];
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedSchedules.length === filteredSchedules.length) {
      setSelectedSchedules([]);
    } else {
      setSelectedSchedules(filteredSchedules.map(schedule => schedule.scheduleId));
    }
  };

  const calculateOccupancyRate = (seats) => {
    if (!seats || !Array.isArray(seats)) {
      return 0;
    }
    const totalSeats = seats.length;
    if (totalSeats === 0) {
      return 0;
    }
    const bookedSeats = seats.filter(seat => seat.booked).length;
    return ((bookedSeats / totalSeats) * 100).toFixed(2);
  };
  const getOccupancyColor = (rate) => {
    const rateNum = parseFloat(rate);
    if (rateNum >= 80) return 'text-red-600 bg-red-100';
    if (rateNum >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  // Enhanced sorting function
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get schedule status based on dates
  const getScheduleStatus = (schedule) => {
    const now = new Date();
    const departureTime = new Date(schedule.departureTime);
    const arrivalTime = new Date(schedule.arrivalTime);
    
    if (now < departureTime) return 'upcoming';
    if (now >= departureTime && now <= arrivalTime) return 'in-progress';
    return 'completed';
  };

  // Enhanced filtering and sorting logic
  const sortedAndFilteredSchedules = useMemo(() => {
    let filtered = schedules.filter((schedule) => {
      // Basic filters
      const matchesDate = filterDate ? 
        new Date(schedule.departureTime).toLocaleDateString() === new Date(filterDate).toLocaleDateString() : true;
      const matchesRoute = filterRoute ? 
        (schedule.route?.origin && getLocationNameByCode(schedule.route.origin).toLowerCase().includes(filterRoute.toLowerCase())) || 
        (schedule.route?.destination && getLocationNameByCode(schedule.route.destination).toLowerCase().includes(filterRoute.toLowerCase())) 
        : true;
      const matchesBusNumber = filterBusNumber ? 
        schedule.bus?.busNumber?.toLowerCase().includes(filterBusNumber.toLowerCase()) : true;
      
      // Enhanced filters
      const matchesSearch = searchTerm ? 
        (schedule.bus?.busNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         schedule.driver?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         schedule.driver?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         (schedule.route?.origin && getLocationNameByCode(schedule.route.origin).toLowerCase().includes(searchTerm.toLowerCase())) ||
         (schedule.route?.destination && getLocationNameByCode(schedule.route.destination).toLowerCase().includes(searchTerm.toLowerCase()))
        ) : true;
      
      const scheduleStatus = getScheduleStatus(schedule);
      const matchesStatus = statusFilter === 'all' || scheduleStatus === statusFilter;
      
      const occupancyRate = parseFloat(calculateOccupancyRate(schedule.seats || []));
      let matchesOccupancy = true;
      if (occupancyFilter === 'low') matchesOccupancy = occupancyRate < 50;
      else if (occupancyFilter === 'medium') matchesOccupancy = occupancyRate >= 50 && occupancyRate < 80;
      else if (occupancyFilter === 'high') matchesOccupancy = occupancyRate >= 80;
      
      return matchesDate && matchesRoute && matchesBusNumber && matchesSearch && matchesStatus && matchesOccupancy;
    });

    // Sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortConfig.key) {
          case 'departureTime':
            aValue = new Date(a.departureTime);
            bValue = new Date(b.departureTime);
            break;
          case 'arrivalTime':
            aValue = new Date(a.arrivalTime);
            bValue = new Date(b.arrivalTime);
            break;
          case 'route':
            aValue = a.route?.origin ? getLocationNameByCode(a.route.origin) : '';
            bValue = b.route?.origin ? getLocationNameByCode(b.route.origin) : '';
            break;
          case 'busNumber':
            aValue = a.bus?.busNumber || '';
            bValue = b.bus?.busNumber || '';
            break;
          case 'occupancy':
            aValue = parseFloat(calculateOccupancyRate(a.seats || []));
            bValue = parseFloat(calculateOccupancyRate(b.seats || []));
            break;
          case 'driver':
            aValue = a.driver ? `${a.driver.firstName} ${a.driver.lastName}` : '';
            bValue = b.driver ? `${b.driver.firstName} ${b.driver.lastName}` : '';
            break;
          default:
            aValue = a[sortConfig.key] || '';
            bValue = b[sortConfig.key] || '';
        }
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return filtered;
  }, [schedules, filterDate, filterRoute, filterBusNumber, searchTerm, statusFilter, occupancyFilter, sortConfig]);

  // Pagination logic
  const paginatedSchedules = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedAndFilteredSchedules.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedAndFilteredSchedules, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedAndFilteredSchedules.length / itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterDate, filterRoute, filterBusNumber, searchTerm, statusFilter, occupancyFilter]);

  // Update legacy variable for compatibility
  const filteredSchedules = paginatedSchedules;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        <div className="p-8 overflow-y-auto h-full">          {/* Enhanced Header with Stats */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Quản lý Lịch trình</h1>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                  </svg>
                  Bộ lọc
                </button>
                <button
                  onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {viewMode === 'table' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  )}
                  {viewMode === 'table' ? 'Thẻ' : 'Bảng'}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Tổng số chuyến</p>
                    <p className="text-2xl font-bold text-gray-800">{schedules.length}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Xe đang hoạt động</p>
                    <p className="text-2xl font-bold text-blue-600">{buses.length}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Tài xế sẵn sàng</p>
                    <p className="text-2xl font-bold text-green-600">{drivers.length}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Đã lọc</p>
                    <p className="text-2xl font-bold text-purple-600">{sortedAndFilteredSchedules.length}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Search Bar */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tìm kiếm theo số xe, tài xế, tuyến đường..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <button
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                  onClick={() => {
                    setSelectedSchedule(null);
                    setIsScheduleModalOpen(true);
                  }}
                >
                  + Thêm lịch trình
                </button>
                <button
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                  onClick={() => {
                    setIsMultiScheduleModalOpen(true);
                  }}
                >
                  + Thêm nhiều
                </button>
                {selectedSchedules.length > 0 && (
                  <button
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                    onClick={() => setIsDeleteModalOpen(true)}
                  >
                    Xóa ({selectedSchedules.length})
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Filters Panel */}
          {showFilters && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ngày khởi hành</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tuyến đường</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập điểm đi/đến..."
                    value={filterRoute}
                    onChange={(e) => setFilterRoute(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số xe</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập số xe..."
                    value={filterBusNumber}
                    onChange={(e) => setFilterBusNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Tất cả</option>
                    <option value="upcoming">Sắp khởi hành</option>
                    <option value="in-progress">Đang di chuyển</option>
                    <option value="completed">Đã hoàn thành</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tỉ lệ đặt chỗ</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={occupancyFilter}
                    onChange={(e) => setOccupancyFilter(e.target.value)}
                  >
                    <option value="all">Tất cả</option>
                    <option value="low">Thấp (&lt; 50%)</option>
                    <option value="medium">Trung bình (50-80%)</option>
                    <option value="high">Cao (&gt; 80%)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setFilterDate('');
                    setFilterRoute('');
                    setFilterBusNumber('');
                    setSearchTerm('');
                    setStatusFilter('all');
                    setOccupancyFilter('all');
                    setSortConfig({ key: '', direction: 'asc' });
                  }}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Xóa tất cả bộ lọc
                </button>
                <div className="text-sm text-gray-500">
                  Hiển thị {sortedAndFilteredSchedules.length} / {schedules.length} lịch trình
                </div>
              </div>
            </div>
          )}          {/* Enhanced Schedule Table/Cards */}
          {viewMode === 'table' ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-4 text-left">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          checked={selectedSchedules.length === filteredSchedules.length && filteredSchedules.length > 0}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('departureTime')}
                      >
                        <div className="flex items-center gap-2">
                          Giờ khởi hành
                          {sortConfig.key === 'departureTime' && (
                            <svg className={`w-4 h-4 ${sortConfig.direction === 'asc' ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('departureTime')}
                      >
                        <div className="flex items-center gap-2">
                          Ngày xuất phát
                          {sortConfig.key === 'departureTime' && (
                            <svg className={`w-4 h-4 ${sortConfig.direction === 'asc' ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('arrivalTime')}
                      >
                        <div className="flex items-center gap-2">
                          Ngày tới
                          {sortConfig.key === 'arrivalTime' && (
                            <svg className={`w-4 h-4 ${sortConfig.direction === 'asc' ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('route')}
                      >
                        <div className="flex items-center gap-2">
                          Tuyến đường
                          {sortConfig.key === 'route' && (
                            <svg className={`w-4 h-4 ${sortConfig.direction === 'asc' ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('busNumber')}
                      >
                        <div className="flex items-center gap-2">
                          Xe
                          {sortConfig.key === 'busNumber' && (
                            <svg className={`w-4 h-4 ${sortConfig.direction === 'asc' ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('driver')}
                      >
                        <div className="flex items-center gap-2">
                          Tài xế chính
                          {sortConfig.key === 'driver' && (
                            <svg className={`w-4 h-4 ${sortConfig.direction === 'asc' ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Tài xế phụ</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Phụ xe</th>
                      <th 
                        className="px-6 py-4 text-left text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('occupancy')}
                      >
                        <div className="flex items-center gap-2">
                          Tỉ lệ đặt chỗ
                          {sortConfig.key === 'occupancy' && (
                            <svg className={`w-4 h-4 ${sortConfig.direction === 'asc' ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Trạng thái</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Loại</th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredSchedules.length > 0 ? (
                      filteredSchedules.map((schedule) => {
                        const occupancyRate = calculateOccupancyRate(schedule.seats || []);
                        const isSelected = selectedSchedules.includes(schedule.scheduleId);
                        const status = getScheduleStatus(schedule);
                        
                        return (
                          <tr 
                            key={schedule.scheduleId} 
                            className={`${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'} transition-colors duration-200`}
                          >
                            <td className="px-3 py-4">
                              <input 
                                type="checkbox" 
                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                checked={isSelected}
                                onChange={() => toggleScheduleSelection(schedule.scheduleId)}
                              />
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                              {new Date(schedule.departureTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                              {new Date(schedule.departureTime).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                              {new Date(schedule.arrivalTime).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <div className="flex items-center gap-2">
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-900">
                                    {schedule.route?.origin ? getLocationNameByCode(schedule.route.origin) : 'N/A'}
                                  </span>
                                  <span className="text-gray-400 text-xs">→</span>
                                  <span className="font-medium text-gray-900">
                                    {schedule.route?.destination ? getLocationNameByCode(schedule.route.destination) : 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {schedule.bus ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {schedule.bus.busNumber}
                                </span>
                              ) : (
                                <span className="text-gray-400">N/A</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {schedule.driver ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-medium">
                                      {schedule.driver.firstName.charAt(0)}{schedule.driver.lastName.charAt(0)}
                                    </span>
                                  </div>
                                  <span>{schedule.driver.firstName} {schedule.driver.lastName}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400">Chưa phân công</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {schedule.secondDriver ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-medium">
                                      {schedule.secondDriver.firstName.charAt(0)}{schedule.secondDriver.lastName.charAt(0)}
                                    </span>
                                  </div>
                                  <span>{schedule.secondDriver.firstName} {schedule.secondDriver.lastName}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400">Chưa phân công</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {schedule.assistant ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-medium">
                                      {schedule.assistant.firstName.charAt(0)}{schedule.assistant.lastName.charAt(0)}
                                    </span>
                                  </div>
                                  <span>{schedule.assistant.firstName} {schedule.assistant.lastName}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400">Chưa phân công</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOccupancyColor(occupancyRate)}`}>
                                  {occupancyRate}%
                                </span>
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      parseFloat(occupancyRate) >= 80 ? 'bg-red-500' :
                                      parseFloat(occupancyRate) >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${occupancyRate}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                                status === 'in-progress' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {status === 'upcoming' ? 'Sắp khởi hành' :
                                 status === 'in-progress' ? 'Đang di chuyển' : 'Đã hoàn thành'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {schedule.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-right space-x-3 whitespace-nowrap">
                              <button
                                className="text-blue-600 hover:text-blue-900 font-medium"
                                onClick={() => {
                                  setSelectedSchedule(schedule);
                                  setIsScheduleModalOpen(true);
                                }}
                              >
                                Sửa
                              </button>
                              <button
                                className="text-red-600 hover:text-red-900 font-medium"
                                onClick={() => {
                                  if (window.confirm(`Bạn có chắc chắn muốn xóa lịch trình này không?`)) {
                                    handleDeleteSchedule(schedule.scheduleId);
                                  }
                                }}
                              >
                                Xóa
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="13" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="text-lg font-medium mb-1">Không tìm thấy lịch trình nào</h3>
                            <p className="text-sm">Thử điều chỉnh bộ lọc hoặc thêm lịch trình mới</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Card View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSchedules.length > 0 ? (
                filteredSchedules.map((schedule) => {
                  const occupancyRate = calculateOccupancyRate(schedule.seats || []);
                  const isSelected = selectedSchedules.includes(schedule.scheduleId);
                  const status = getScheduleStatus(schedule);
                  
                  return (
                    <div 
                      key={schedule.scheduleId}
                      className={`bg-white rounded-xl shadow-sm border ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-100 hover:border-gray-200'} transition-all duration-200 overflow-hidden`}
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            checked={isSelected}
                            onChange={() => toggleScheduleSelection(schedule.scheduleId)}
                          />
                          <div className="flex gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                              status === 'in-progress' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {status === 'upcoming' ? 'Sắp khởi hành' :
                               status === 'in-progress' ? 'Đang di chuyển' : 'Đã hoàn thành'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {schedule.route?.origin ? getLocationNameByCode(schedule.route.origin) : 'N/A'} 
                            <span className="text-gray-400 mx-2">→</span>
                            {schedule.route?.destination ? getLocationNameByCode(schedule.route.destination) : 'N/A'}
                          </h3>
                          <div className="text-sm text-gray-600">
                            <div className="mb-1">
                              <strong>Khởi hành:</strong> {new Date(schedule.departureTime).toLocaleString('vi-VN')}
                            </div>
                            <div>
                              <strong>Đến:</strong> {new Date(schedule.arrivalTime).toLocaleString('vi-VN')}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Xe:</span>
                            {schedule.bus ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {schedule.bus.busNumber}
                              </span>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Tài xế:</span>
                            <span className="text-sm text-gray-900">
                              {schedule.driver ? `${schedule.driver.firstName} ${schedule.driver.lastName}` : "Chưa phân công"}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Tỉ lệ đặt chỗ:</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-medium ${getOccupancyColor(occupancyRate).replace('bg-', 'text-').replace('-100', '-800')}`}>
                                {occupancyRate}%
                              </span>
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    parseFloat(occupancyRate) >= 80 ? 'bg-red-500' :
                                    parseFloat(occupancyRate) >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${occupancyRate}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between pt-4 border-t border-gray-200">
                          <button
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                            onClick={() => {
                              setSelectedSchedule(schedule);
                              setIsScheduleModalOpen(true);
                            }}
                          >
                            Chỉnh sửa
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                            onClick={() => {
                              if (window.confirm(`Bạn có chắc chắn muốn xóa lịch trình này không?`)) {
                                handleDeleteSchedule(schedule.scheduleId);
                              }
                            }}
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-xl font-medium mb-2">Không tìm thấy lịch trình nào</h3>
                  <p className="text-sm">Thử điều chỉnh bộ lọc hoặc thêm lịch trình mới</p>
                </div>
              )}
            </div>
          )}

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">
                  Hiển thị {Math.min((currentPage - 1) * itemsPerPage + 1, sortedAndFilteredSchedules.length)} đến {Math.min(currentPage * itemsPerPage, sortedAndFilteredSchedules.length)} trong {sortedAndFilteredSchedules.length} kết quả
                </span>
                <select
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                >
                  <option value={5}>5 / trang</option>
                  <option value={10}>10 / trang</option>
                  <option value={20}>20 / trang</option>
                  <option value={50}>50 / trang</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                
                {[...Array(Math.min(totalPages, 7))].map((_, index) => {
                  let pageNumber;
                  if (totalPages <= 7) {
                    pageNumber = index + 1;
                  } else if (currentPage <= 4) {
                    pageNumber = index + 1;
                  } else if (currentPage >= totalPages - 3) {
                    pageNumber = totalPages - 6 + index;
                  } else {
                    pageNumber = currentPage - 3 + index;
                  }
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg ${
                        currentPage === pageNumber
                          ? 'text-blue-600 bg-blue-50 border border-blue-300'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        <Suspense fallback={<div className="text-center">Loading...</div>}>
          {isScheduleModalOpen && (
            <ScheduleModal
              isOpen={isScheduleModalOpen}
              onClose={() => setIsScheduleModalOpen(false)}
              onSave={handleSaveSchedule}
              schedule={selectedSchedule}
              buses={buses}
              routes={[]}
              drivers={drivers}
              assistants={assistants}
              secondDrivers={drivers}
            />
          )}
        </Suspense>

        <Suspense fallback={<div className="text-center">Loading...</div>}>
          {isBusModalOpen && (
            <BusModal
              isOpen={isBusModalOpen}
              onClose={() => setIsBusModalOpen(false)}
              bus={selectedBus}
            />
          )}
        </Suspense>
        
        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl max-w-md mx-auto p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Xác nhận xóa</h3>
              <p className="text-gray-700 mb-6">
                Bạn có chắc chắn muốn xóa {selectedSchedules.length} lịch trình đã chọn không? Hành động này không thể hoàn tác.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={deleteInProgress}
                >
                  Hủy
                </button>
                <button
                  className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center ${deleteInProgress ? 'opacity-75 cursor-not-allowed' : ''}`}
                  onClick={handleDeleteMultipleSchedules}
                  disabled={deleteInProgress}
                >
                  {deleteInProgress ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang xóa...
                    </>
                  ) : (
                    'Xóa lịch trình'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Management;