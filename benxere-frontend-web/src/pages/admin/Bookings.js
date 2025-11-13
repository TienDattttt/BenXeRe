import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/layouts/admin/admin-layout';
import { getAllBookings, createBooking, updateBooking, deleteBooking } from '../../services/booking-service';
import { getUserById } from '../../services/user-service';
import BookingModal from '../../components/booking-modal';
import UserDetailModal from '../../components/user-detail-modal';
import { FaPlus, FaSearch, FaPen, FaTrash, FaSort, FaSortUp, FaSortDown, FaFilter, FaEye, FaTicketAlt, FaMoneyBillWave, FaCheck, FaClock, FaUser, FaInfoCircle } from 'react-icons/fa';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [userDetails, setUserDetails] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('bookingId');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [bookingsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isUserDetailModalOpen, setIsUserDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); 

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!bookings.length) return;

      const uniqueUserIds = [...new Set(bookings.map(booking => booking.userId).filter(Boolean))];

      try {
        const userDetailsObj = {};

        for (const userId of uniqueUserIds) {
          try {
            const user = await getUserById(userId);
            if (user) {
              userDetailsObj[userId] = user;
            }
          } catch (err) {
            console.error(`Error fetching details for user ${userId}:`, err);
          }
        }

        setUserDetails(userDetailsObj);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, [bookings]);

  const getUserDisplay = (userId) => {
    if (!userId) return 'N/A';

    const user = userDetails[userId];
    if (!user) return `User #${userId}`;

    return user.email || `${user.lastName || ''} ${user.firstName || ''}`.trim() || `User #${userId}`;
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllBookings();
      setBookings(response || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Không thể tải danh sách đặt vé. Vui lòng thử lại sau.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBooking = () => {
    setSelectedBooking(null);
    setIsModalOpen(true);
  };

  const handleEditBooking = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleViewBooking = (booking) => {
    console.log('View booking details:', booking);
  };

  const handleSaveBooking = async (bookingData) => {
    try {
      setLoading(true);
      if (selectedBooking) {
        await updateBooking(selectedBooking.bookingId, bookingData);
      } else {
        await createBooking(bookingData);
      }
      await fetchBookings();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving booking:', error);
      setError('Không thể lưu thông tin đặt vé. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đơn đặt vé này không?')) {
      try {
        setLoading(true);
        await deleteBooking(id);
        await fetchBookings();
      } catch (error) {
        console.error('Error deleting booking:', error);
        setError('Không thể xóa đơn đặt vé. Vui lòng thử lại sau.');
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleUserClick = async (userId) => {
    try {
      if (userDetails[userId]) {
        console.log('Using cached user details:', userDetails[userId]);
        setSelectedUser(userDetails[userId]);
        setIsUserDetailModalOpen(true);
        return;
      }

      setLoading(true);
      console.log('Fetching user details for ID:', userId);
      const user = await getUserById(userId);
      console.log('API response for user details:', user);

      setUserDetails(prev => ({
        ...prev,
        [userId]: user
      }));

      setSelectedUser(user);
      setIsUserDetailModalOpen(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Không thể tải thông tin khách hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const userDisplay = getUserDisplay(booking.userId).toLowerCase();

    const matchesSearch = (
      booking.bookingId?.toString().includes(searchTerm) ||
      booking.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userDisplay.includes(searchTerm.toLowerCase()) ||
      booking.schedule?.scheduleId?.toString().includes(searchTerm)
    );

    const matchesStatus = statusFilter === 'all' || booking.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (sortField === 'userId') {
      const userA = getUserDisplay(a.userId).toLowerCase();
      const userB = getUserDisplay(b.userId).toLowerCase();
      return sortDirection === 'asc'
        ? userA.localeCompare(userB)
        : userB.localeCompare(userA);
    }

    if (a[sortField] === undefined || b[sortField] === undefined) return 0;

    let valueA, valueB;

    if (sortField === 'bookingDate') {
      return sortDirection === 'asc'
        ? new Date(a.bookingDate) - new Date(b.bookingDate)
        : new Date(b.bookingDate) - new Date(a.bookingDate);
    } else {
      valueA = typeof a[sortField] === 'string' ? a[sortField].toLowerCase() : a[sortField];
      valueB = typeof b[sortField] === 'string' ? b[sortField].toLowerCase() : b[sortField];
    }

    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = sortedBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(sortedBookings.length / bookingsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="ml-1 text-gray-400" />;
    return sortDirection === 'asc' ? <FaSortUp className="ml-1 text-blue-500" /> : <FaSortDown className="ml-1 text-blue-500" />;
  };

  const uniqueStatuses = ['all', ...new Set(bookings.map(booking => booking.status?.toLowerCase()))].filter(Boolean);

  return (
    <AdminLayout>
      <div className="mb-6">
        <motion.h1
          className="text-2xl font-bold text-gray-800 flex items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FaTicketAlt className="mr-2" /> Quản lý đặt vé
        </motion.h1>
        <p className="text-gray-600">Quản lý thông tin đặt vé của khách hàng</p>
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
              placeholder="Tìm kiếm đặt vé..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border rounded-lg bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'Tất cả trạng thái' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            <button
              onClick={handleAddBooking}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FaPlus className="mr-2" /> Thêm đặt vé
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th
                  className="py-3 px-4 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('bookingId')}
                >
                  <div className="flex items-center">
                    ID {getSortIcon('bookingId')}
                  </div>
                </th>
                <th
                  className="py-3 px-4 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('userId')}
                >
                  <div className="flex items-center">
                    Khách hàng {getSortIcon('userId')}
                  </div>
                </th>
                <th
                  className="py-3 px-4 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('schedule')}
                >
                  <div className="flex items-center">
                    Lịch trình {getSortIcon('schedule')}
                  </div>
                </th>
                <th
                  className="py-3 px-4 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('totalPrice')}
                >
                  <div className="flex items-center">
                    Tổng tiền {getSortIcon('totalPrice')}
                  </div>
                </th>
                <th
                  className="py-3 px-4 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Trạng thái {getSortIcon('status')}
                  </div>
                </th>
                <th
                  className="py-3 px-4 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('bookingDate')}
                >
                  <div className="flex items-center">
                    Ngày đặt {getSortIcon('bookingDate')}
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
              ) : currentBookings.length > 0 ? (
                currentBookings.map((booking) => (
                  <tr
                    key={booking.bookingId}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">{booking.bookingId}</td>
                    <td className="py-3 px-4">
                      <div
                        className="flex items-center cursor-pointer hover:text-blue-600 group"
                        onClick={() => handleUserClick(booking.userId)}
                        title="Click to view user details"
                      >
                        <FaUser className="text-blue-500 mr-2 group-hover:scale-110 transition-transform" />
                        <div>
                          <div className="font-medium group-hover:underline">
                            {getUserDisplay(booking.userId)}
                          </div>
                          {userDetails[booking.userId]?.phone &&
                            <div className="text-xs text-gray-500">{userDetails[booking.userId].phone}</div>
                          }
                          <div className="text-xs text-blue-500">
                            <FaInfoCircle className="inline mr-1" /> User ID: {booking.userId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {booking.schedule ? `#${booking.schedule.scheduleId}` : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <FaMoneyBillWave className="text-green-500 mr-2" />
                        {booking.totalPrice?.toLocaleString()}đ
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <FaClock className="text-gray-500 mr-2" />
                        {new Date(booking.bookingDate).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleViewBooking(booking)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
                          title="Xem chi tiết"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleEditBooking(booking)}
                          className="p-2 bg-yellow-100 text-yellow-600 rounded-full hover:bg-yellow-200"
                          title="Chỉnh sửa"
                        >
                          <FaPen />
                        </button>
                        <button
                          onClick={() => handleDeleteBooking(booking.bookingId)}
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
                    Không tìm thấy thông tin đặt vé nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 px-4">
            <div className="text-sm text-gray-600">
              Hiển thị {indexOfFirstBooking + 1}-{Math.min(indexOfLastBooking, sortedBookings.length)} trong số {sortedBookings.length} đơn đặt vé
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

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBooking}
        booking={selectedBooking}
      />

      <UserDetailModal
        isOpen={isUserDetailModalOpen}
        onRequestClose={() => setIsUserDetailModalOpen(false)}
        user={selectedUser}
      />
    </AdminLayout>
  );
};

export default Bookings;