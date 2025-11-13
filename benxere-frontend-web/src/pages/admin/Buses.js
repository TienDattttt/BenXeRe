import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/layouts/admin/admin-layout';
import { getAllBuses, createBus, updateBus, deleteBus } from '../../services/bus-service';
import BusModal from '../../components/bus-modal';
import { FaPlus, FaSearch, FaPen, FaTrash, FaSort, FaSortUp, FaSortDown, FaFilter, FaEye, FaBus } from 'react-icons/fa';

const Buses = () => {
  const [buses, setBuses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('busId');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [busesPerPage] = useState(10);
  
  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllBuses();
      setBuses(data || []);
    } catch (error) {
      console.error('Error fetching buses:', error);
      setError('Không thể tải danh sách xe. Vui lòng thử lại sau.');
      setBuses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBus = () => {
    setSelectedBus(null);
    setIsModalOpen(true);
  };

  const handleEditBus = (bus) => {
    setSelectedBus(bus);
    setIsModalOpen(true);
  };

  const handleViewBus = (bus) => {
    // Placeholder for view bus details
    console.log('View bus details:', bus);
  };

  const handleSaveBus = async (busData, images) => {
    try {
      setLoading(true);
      if (selectedBus) {
        await updateBus(selectedBus.busId, busData);
      } else {
        await createBus(busData, images);
      }
      await fetchBuses();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving bus:', error);
      setError('Không thể lưu thông tin xe. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBus = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa xe này không?')) {
      try {
        setLoading(true);
        await deleteBus(id);
        await fetchBuses();
      } catch (error) {
        console.error('Error deleting bus:', error);
        setError('Không thể xóa xe. Vui lòng thử lại sau.');
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

  // Filter buses based on search term
  const filteredBuses = buses.filter(bus => 
    bus.busNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bus.busType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bus.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bus.owner && (bus.owner.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  bus.owner.lastName?.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  // Sort buses
  const sortedBuses = [...filteredBuses].sort((a, b) => {
    if (!a[sortField] || !b[sortField]) return 0;
    
    let valueA, valueB;
    
    if (sortField === 'owner') {
      valueA = a.owner ? `${a.owner.firstName} ${a.owner.lastName}`.toLowerCase() : '';
      valueB = b.owner ? `${b.owner.firstName} ${b.owner.lastName}`.toLowerCase() : '';
    } else {
      valueA = typeof a[sortField] === 'string' ? a[sortField].toLowerCase() : a[sortField];
      valueB = typeof b[sortField] === 'string' ? b[sortField].toLowerCase() : b[sortField];
    }
    
    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const indexOfLastBus = currentPage * busesPerPage;
  const indexOfFirstBus = indexOfLastBus - busesPerPage;
  const currentBuses = sortedBuses.slice(indexOfFirstBus, indexOfLastBus);
  const totalPages = Math.ceil(sortedBuses.length / busesPerPage);

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
          <FaBus className="mr-2" /> Quản lý xe
        </motion.h1>
        <p className="text-gray-600">Quản lý thông tin xe và phương tiện</p>
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
              placeholder="Tìm kiếm xe..."
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
              onClick={handleAddBus}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FaPlus className="mr-2" /> Thêm xe mới
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th 
                  className="py-3 px-4 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('busId')}
                >
                  <div className="flex items-center">
                    ID {getSortIcon('busId')}
                  </div>
                </th>
                <th 
                  className="py-3 px-4 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('busNumber')}
                >
                  <div className="flex items-center">
                    Số xe {getSortIcon('busNumber')}
                  </div>
                </th>
                <th 
                  className="py-3 px-4 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('busType')}
                >
                  <div className="flex items-center">
                    Loại xe {getSortIcon('busType')}
                  </div>
                </th>
                <th 
                  className="py-3 px-4 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('capacity')}
                >
                  <div className="flex items-center">
                    Sức chứa {getSortIcon('capacity')}
                  </div>
                </th>
                <th 
                  className="py-3 px-4 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('companyName')}
                >
                  <div className="flex items-center">
                    Công ty {getSortIcon('companyName')}
                  </div>
                </th>
                <th 
                  className="py-3 px-4 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('owner')}
                >
                  <div className="flex items-center">
                    Chủ sở hữu {getSortIcon('owner')}
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
                  <td colSpan="8" className="text-center py-4">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : currentBuses.length > 0 ? (
                currentBuses.map((bus) => (
                  <tr 
                    key={bus.busId} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">{bus.busId}</td>
                    <td className="py-3 px-4">{bus.busNumber}</td>
                    <td className="py-3 px-4">{bus.busType}</td>
                    <td className="py-3 px-4">{bus.capacity}</td>
                    <td className="py-3 px-4">{bus.companyName}</td>
                    <td className="py-3 px-4">{bus.owner ? `${bus.owner.firstName} ${bus.owner.lastName}` : 'N/A'}</td>
                    <td className="py-3 px-4">{new Date(bus.createdAt).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center space-x-2">
                        <button 
                          onClick={() => handleViewBus(bus)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
                          title="Xem chi tiết"
                        >
                          <FaEye />
                        </button>
                        <button 
                          onClick={() => handleEditBus(bus)}
                          className="p-2 bg-yellow-100 text-yellow-600 rounded-full hover:bg-yellow-200"
                          title="Chỉnh sửa"
                        >
                          <FaPen />
                        </button>
                        <button 
                          onClick={() => handleDeleteBus(bus.busId)}
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
                  <td colSpan="8" className="text-center py-4 text-gray-500">
                    Không tìm thấy thông tin xe nào
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
              Hiển thị {indexOfFirstBus + 1}-{Math.min(indexOfLastBus, sortedBuses.length)} trong số {sortedBuses.length} xe
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

      <BusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBus}
        bus={selectedBus}
      />
    </AdminLayout>
  );
};

export default Buses;