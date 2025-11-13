import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/layouts/admin/admin-layout';
import { getAllSchedules, createSchedule, updateSchedule, deleteSchedule } from '../../services/schedule-service';
import { getAllBuses } from '../../services/bus-service';
import { getAllRoutes } from '../../services/route-service';
import { getAllLocations, createLocation } from '../../services/location-service';
import ScheduleModal from '../../components/schedule-modal';
import { FaPlus, FaSearch, FaPen, FaTrash, FaSort, FaSortUp, FaSortDown, FaFilter, FaEye, FaCalendarAlt, FaBus, FaRoute, FaClock } from 'react-icons/fa';
import { getLocationNameByCode } from '../../utils/load-location';

const Schedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('scheduleId');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [schedulesPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [scheduleResponse, busResponse, routeResponse, locationResponse] = await Promise.all([
        getAllSchedules(),
        getAllBuses(),
        getAllRoutes(),
        getAllLocations()
      ]);
      
      setSchedules(scheduleResponse|| []);
      setBuses(busResponse || []);
      setRoutes(routeResponse || []);
      setLocations(locationResponse.result || []);
    } catch (error) {
      console.error('Error fetching data:', error.response ? error.response.data : error.message);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = () => {
    setSelectedSchedule(null);
    setIsModalOpen(true);
  };

  const handleEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setIsModalOpen(true);
  };

  const handleViewSchedule = (schedule) => {
    // Placeholder for view schedule details
    console.log('View schedule details:', schedule);
  };

  const handleSaveSchedule = async (scheduleData) => {
    try {
      setLoading(true);
      
      const newPickUpLocations = await Promise.all(
        scheduleData.pickUpLocationIds.map(async (locationId) => {
          const existingLocation = locations.find((loc) => loc.locationId === locationId);
          if (!existingLocation) {
            const newLocation = await createLocation({ name: locationId });
            return newLocation.result.locationId;
          }
          return locationId;
        })
      );

      const newDropOffLocations = await Promise.all(
        scheduleData.dropOffLocationIds.map(async (locationId) => {
          const existingLocation = locations.find((loc) => loc.locationId === locationId);
          if (!existingLocation) {
            const newLocation = await createLocation({ name: locationId });
            return newLocation.result.locationId;
          }
          return locationId;
        })
      );

      scheduleData.pickUpLocationIds = newPickUpLocations;
      scheduleData.dropOffLocationIds = newDropOffLocations;

      if (selectedSchedule) {
        await updateSchedule(selectedSchedule.scheduleId, scheduleData);
      } else {
        await createSchedule(scheduleData);
      }

      await fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving schedule:', error.response ? error.response.data : error.message);
      setError('Không thể lưu lịch trình. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lịch trình này không?')) {
      try {
        setLoading(true);
        await deleteSchedule(id);
        await fetchData();
      } catch (error) {
        console.error('Error deleting schedule:', error.response ? error.response.data : error.message);
        setError('Không thể xóa lịch trình. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSort = (field) => {
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
  };

  const filteredSchedules = schedules.filter(schedule => {
    const busNumber = schedule.bus?.busNumber?.toLowerCase() || '';
    const origin = getLocationNameByCode(schedule.route?.origin)?.toLowerCase() || '';
    const destination = getLocationNameByCode(schedule.route?.destination)?.toLowerCase() || '';
    const departureTime = new Date(schedule.departureTime).toLocaleString().toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return busNumber.includes(searchLower) || 
           origin.includes(searchLower) || 
           destination.includes(searchLower) ||
           departureTime.includes(searchLower);
  });

  // Sort schedules
  const sortedSchedules = [...filteredSchedules].sort((a, b) => {
    if (!a[sortField] && !b[sortField]) return 0;
    if (!a[sortField]) return 1;
    if (!b[sortField]) return -1;
    
    let valueA, valueB;
    
    if (sortField === 'bus') {
      valueA = a.bus?.busNumber?.toLowerCase() || '';
      valueB = b.bus?.busNumber?.toLowerCase() || '';
    } else if (sortField === 'route') {
      valueA = `${getLocationNameByCode(a.route?.origin)} - ${getLocationNameByCode(a.route?.destination)}`.toLowerCase();
      valueB = `${getLocationNameByCode(b.route?.origin)} - ${getLocationNameByCode(b.route?.destination)}`.toLowerCase();
    } else if (sortField === 'departureTime' || sortField === 'arrivalTime') {
      return sortDirection === 'asc' 
        ? new Date(a[sortField]) - new Date(b[sortField])
        : new Date(b[sortField]) - new Date(a[sortField]);
    } else {
      valueA = typeof a[sortField] === 'string' ? a[sortField].toLowerCase() : a[sortField];
      valueB = typeof b[sortField] === 'string' ? b[sortField].toLowerCase() : b[sortField];
    }
    
    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const indexOfLastSchedule = currentPage * schedulesPerPage;
  const indexOfFirstSchedule = indexOfLastSchedule - schedulesPerPage;
  const currentSchedules = sortedSchedules.slice(indexOfFirstSchedule, indexOfLastSchedule);
  const totalPages = Math.ceil(sortedSchedules.length / schedulesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="ml-1 text-gray-400" />;
    return sortDirection === 'asc' ? <FaSortUp className="ml-1 text-blue-500" /> : <FaSortDown className="ml-1 text-blue-500" />;
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <motion.h1 
          className="text-2xl font-bold text-gray-800 flex items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FaCalendarAlt className="mr-2" /> Quản lý lịch trình
        </motion.h1>
        <p className="text-gray-600">Quản lý lịch trình chuyến xe</p>
      </div>

      {error && (
        <motion.div 
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p>{error}</p>
        </motion.div>
      )}

      <motion.div 
        className="bg-white rounded-lg shadow-sm mb-6 p-4 border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm lịch trình..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button 
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <FaFilter className="mr-2" /> Lọc
            </button>
            <button
              onClick={handleAddSchedule}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FaPlus className="mr-2" /> Thêm lịch trình
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th 
                  className="py-3 px-4 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('scheduleId')}
                >
                  <div className="flex items-center">
                    ID {getSortIcon('scheduleId')}
                  </div>
                </th>
                <th 
                  className="py-3 px-4 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('bus')}
                >
                  <div className="flex items-center">
                    Xe {getSortIcon('bus')}
                  </div>
                </th>
                <th 
                  className="py-3 px-4 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('route')}
                >
                  <div className="flex items-center">
                    Tuyến đường {getSortIcon('route')}
                  </div>
                </th>
                <th 
                  className="py-3 px-4 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('departureTime')}
                >
                  <div className="flex items-center">
                    Giờ khởi hành {getSortIcon('departureTime')}
                  </div>
                </th>
                <th 
                  className="py-3 px-4 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('arrivalTime')}
                >
                  <div className="flex items-center">
                    Giờ đến {getSortIcon('arrivalTime')}
                  </div>
                </th>
                <th 
                  className="py-3 px-4 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('pricePerSeat')}
                >
                  <div className="flex items-center">
                    Giá vé {getSortIcon('pricePerSeat')}
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : currentSchedules.length > 0 ? (
                currentSchedules.map((schedule) => (
                  <tr 
                    key={schedule.scheduleId} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">{schedule.scheduleId}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <FaBus className="text-blue-500 mr-2" />
                        {schedule.bus?.busNumber || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <FaRoute className="text-green-500 mr-2" />
                        {schedule.route ? `${getLocationNameByCode(schedule.route.origin)} → ${getLocationNameByCode(schedule.route.destination)}` : 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <FaClock className="text-orange-500 mr-2" />
                        {new Date(schedule.departureTime).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <FaClock className="text-red-500 mr-2" />
                        {new Date(schedule.arrivalTime).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium">{schedule.pricePerSeat.toLocaleString()}đ</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center space-x-2">
                        <button 
                          onClick={() => handleViewSchedule(schedule)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
                          title="Xem chi tiết"
                        >
                          <FaEye />
                        </button>
                        <button 
                          onClick={() => handleEditSchedule(schedule)}
                          className="p-2 bg-yellow-100 text-yellow-600 rounded-full hover:bg-yellow-200"
                          title="Chỉnh sửa"
                        >
                          <FaPen />
                        </button>
                        <button 
                          onClick={() => handleDeleteSchedule(schedule.scheduleId)}
                          className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                          title="Xóa"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    Không tìm thấy lịch trình nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 px-4">
            <div className="text-sm text-gray-600">
              Hiển thị {indexOfFirstSchedule + 1}-{Math.min(indexOfLastSchedule, sortedSchedules.length)} trong số {sortedSchedules.length} lịch trình
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                &laquo;
              </button>
              
              {[...Array(totalPages).keys()].map(number => (
                <button
                  key={number + 1}
                  onClick={() => paginate(number + 1)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === number + 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {number + 1}
                </button>
              ))}
              
              <button
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                &raquo;
              </button>
            </div>
          </div>
        )}
      </motion.div>

      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSchedule}
        schedule={selectedSchedule}
        buses={buses}
        routes={routes}
        locations={locations}
      />
    </AdminLayout>
  );
};

export default Schedules;