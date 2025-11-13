import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/layouts/admin/admin-layout';
import { getAllRoutes, createRoute, deleteRoute } from '../../services/route-service';
import RouteModal from '../../components/route-modal';
import { getLocationNameByCode } from '../../utils/load-location';
import { FaPlus, FaSearch, FaPen, FaTrash, FaSort, FaSortUp, FaSortDown, FaFilter, FaEye, FaRoute, FaMapMarkedAlt } from 'react-icons/fa';

const Routes = () => {
  const [routes, setRoutes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('routeId');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [routesPerPage] = useState(10);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllRoutes();
      setRoutes(data || []);
    } catch (error) {
      console.error('Error fetching routes:', error);
      setError('Không thể tải danh sách tuyến đường. Vui lòng thử lại sau.');
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoute = () => {
    setSelectedRoute(null);
    setIsModalOpen(true);
  };

  const handleEditRoute = (route) => {
    setSelectedRoute(route);
    setIsModalOpen(true);
  };

  const handleViewRoute = (route) => {
    // Placeholder for view route details
    console.log('View route details:', route);
  };

  const handleSaveRoute = async (route) => {
    try {
      setLoading(true);
      await createRoute(route);
      await fetchRoutes();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving route:', error);
      setError('Không thể lưu thông tin tuyến đường. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoute = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tuyến đường này không?')) {
      try {
        setLoading(true);
        await deleteRoute(id);
        await fetchRoutes();
      } catch (error) {
        console.error('Error deleting route:', error);
        setError('Không thể xóa tuyến đường. Vui lòng thử lại sau.');
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

  // Filter routes based on search term
  const filteredRoutes = routes.filter(route => 
    getLocationNameByCode(route.origin)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getLocationNameByCode(route.destination)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.routeId?.toString().includes(searchTerm)
  );

  // Sort routes
  const sortedRoutes = [...filteredRoutes].sort((a, b) => {
    if (a[sortField] === undefined || b[sortField] === undefined) return 0;
    
    let valueA, valueB;
    
    if (sortField === 'origin') {
      valueA = getLocationNameByCode(a.origin)?.toLowerCase() || '';
      valueB = getLocationNameByCode(b.origin)?.toLowerCase() || '';
    } else if (sortField === 'destination') {
      valueA = getLocationNameByCode(a.destination)?.toLowerCase() || '';
      valueB = getLocationNameByCode(b.destination)?.toLowerCase() || '';
    } else {
      valueA = typeof a[sortField] === 'string' ? a[sortField].toLowerCase() : a[sortField];
      valueB = typeof b[sortField] === 'string' ? b[sortField].toLowerCase() : b[sortField];
    }
    
    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const indexOfLastRoute = currentPage * routesPerPage;
  const indexOfFirstRoute = indexOfLastRoute - routesPerPage;
  const currentRoutes = sortedRoutes.slice(indexOfFirstRoute, indexOfLastRoute);
  const totalPages = Math.ceil(sortedRoutes.length / routesPerPage);

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
          <FaRoute className="mr-2" /> Quản lý tuyến đường
        </motion.h1>
        <p className="text-gray-600">Quản lý thông tin các tuyến đường trong hệ thống</p>
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
              placeholder="Tìm kiếm tuyến đường..."
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
              onClick={handleAddRoute}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FaPlus className="mr-2" /> Thêm tuyến đường
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th 
                  className="py-3 px-4 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('routeId')}
                >
                  <div className="flex items-center">
                    ID {getSortIcon('routeId')}
                  </div>
                </th>
                <th 
                  className="py-3 px-4 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('origin')}
                >
                  <div className="flex items-center">
                    Điểm đi {getSortIcon('origin')}
                  </div>
                </th>
                <th 
                  className="py-3 px-4 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('destination')}
                >
                  <div className="flex items-center">
                    Điểm đến {getSortIcon('destination')}
                  </div>
                </th>
                <th 
                  className="py-3 px-4 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('distanceKm')}
                >
                  <div className="flex items-center">
                    Khoảng cách (km) {getSortIcon('distanceKm')}
                  </div>
                </th>
                <th 
                  className="py-3 px-4 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center">
                    Ngày tạo {getSortIcon('createdAt')}
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : currentRoutes.length > 0 ? (
                currentRoutes.map((route) => (
                  <tr 
                    key={route.routeId} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">{route.routeId}</td>
                    <td className="py-3 px-4 flex items-center">
                      <FaMapMarkedAlt className="text-red-500 mr-2" />
                      {getLocationNameByCode(route.origin)}
                    </td>
                    <td className="py-3 px-4 flex items-center">
                      <FaMapMarkedAlt className="text-green-500 mr-2" />
                      {getLocationNameByCode(route.destination)}
                    </td>
                    <td className="py-3 px-4">{route.distanceKm}</td>
                    <td className="py-3 px-4">{new Date(route.createdAt).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center space-x-2">
                        <button 
                          onClick={() => handleViewRoute(route)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
                          title="Xem chi tiết"
                        >
                          <FaEye />
                        </button>
                        <button 
                          onClick={() => handleEditRoute(route)}
                          className="p-2 bg-yellow-100 text-yellow-600 rounded-full hover:bg-yellow-200"
                          title="Chỉnh sửa"
                        >
                          <FaPen />
                        </button>
                        <button 
                          onClick={() => handleDeleteRoute(route.routeId)}
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
                  <td colSpan="6" className="text-center py-4 text-gray-500">
                    Không tìm thấy tuyến đường nào
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
              Hiển thị {indexOfFirstRoute + 1}-{Math.min(indexOfLastRoute, sortedRoutes.length)} trong số {sortedRoutes.length} tuyến đường
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

      <RouteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRoute}
        route={selectedRoute}
      />
    </AdminLayout>
  );
};

export default Routes;