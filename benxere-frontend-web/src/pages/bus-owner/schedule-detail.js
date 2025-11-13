import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import Tooltip from "../../components/core/tooltip";
import Chart from "../../components/core/chart";
import { Badge } from "lucide-react";
import {
  DatePickerField,
  SelectField,
  InputField,
} from "../../components/core/form-controls";
import Table from "../../components/core/table";
import { getSchedulesByCurrentOwner } from "../../services/bus-owner/bus-owner-api";
import { BusFront, Users, Ticket, Wallet, CalendarDays, Clock } from "lucide-react";
import { Formik } from "formik";
import UserDetailModal from "../../components/user-detail-modal";

const StatusBadge = ({ status }) => {
  const styles = {
    CONFIRMED: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    CANCELLED: "bg-red-100 text-red-800"
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-800"}`}>
      {status}
    </span>
  );
};

const ScheduleDetailPage = () => {
  const location = useLocation();
  const [schedules, setSchedules] = useState([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [filters, setFilters] = useState({
    date: new Date(),
    status: "all",
    search: "",
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSchedules = async () => {
      try {
        setLoading(true);
        const data = await getSchedulesByCurrentOwner();
        setSchedules(data);
        
        const scheduleIdFromRoute = location.state?.scheduleId;
        
        if (scheduleIdFromRoute && data.some(s => s.scheduleId === scheduleIdFromRoute)) {
          console.log("Setting schedule from router state:", scheduleIdFromRoute);
          setSelectedScheduleId(scheduleIdFromRoute);
          setSelectedSchedule(data.find(s => s.scheduleId === scheduleIdFromRoute));
        } else if (data.length > 0) {
          console.log("Setting default first schedule");
          setSelectedScheduleId(data[0].scheduleId);
          setSelectedSchedule(data[0]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading schedules:", error);
        setLoading(false);
      }
    };
    loadSchedules();
  }, [location.state]);

  useEffect(() => {
    if (selectedScheduleId) {
      const schedule = schedules.find(s => s.scheduleId === selectedScheduleId);
      setSelectedSchedule(schedule);
    }
  }, [selectedScheduleId, schedules]);

  const processedSeats = (selectedSchedule?.seats || []).map((seat) => ({
    ...seat,
    booked: seat.bookingId !== null,
    user: seat.bookingId ? {
      userId: seat.userId,
      firstName: seat.userFirstName || '',
      lastName: seat.userLastName || '',
      email: seat.userEmail || '',
      phone: seat.userPhone || ''
    } : null
  }));

  const upperDeckSeats = processedSeats.filter((seat) => parseInt(seat.seatNumber) <= 12);
  const lowerDeckSeats = processedSeats.filter((seat) => parseInt(seat.seatNumber) > 12);

  const generateDeckRows = (seats, seatsPerRow) => {
    const rows = [];
    for (let i = 0; i < seats.length; i += seatsPerRow) {
      rows.push(seats.slice(i, i + seatsPerRow));
    }
    return rows;
  };

  const upperDeckRows = generateDeckRows(upperDeckSeats, 4);
  const lowerDeckRows = generateDeckRows(lowerDeckSeats, 4);

  const handleSeatClick = (user) => {
    if (user) {
      setSelectedUser(user);
      setIsModalOpen(true);
    }
  };

  const handleScheduleChange = (e) => {
    const id = e.target.value;
    setSelectedScheduleId(id);
    setSelectedSchedule(schedules.find(s => s.scheduleId === id));
  };

  const seats = processedSeats;

  const totalRevenue = (selectedSchedule?.seats || []).reduce((acc, seat) => acc + (seat.price || 0), 0);
  const confirmedBookings = (selectedSchedule?.seats || []).filter(seat => seat.bookingStatus === "CONFIRMED").length;
  const pendingBookings = (selectedSchedule?.seats || []).filter(seat => seat.bookingStatus === "PENDING").length;
  const occupancyRate = (seats.filter(s => s.booked).length / (seats.length || 1)) * 100;

  const stats = [
    {
      title: "Tổng đặt chỗ",
      value: seats.filter(s => s.booked).length,
      icon: <Ticket className="w-6 h-6 text-blue-600" />,
      subtext: `${confirmedBookings} đã xác nhận, ${pendingBookings} chờ duyệt`
    },
    {
      title: "Tỷ lệ lấp đầy",
      value: `${occupancyRate.toFixed(1)}%`,
      icon: <Users className="w-6 h-6 text-green-600" />,
      subtext: `${seats.filter(s => s.booked).length}/${seats.length} chỗ`
    },
    {
      title: "Doanh thu",
      value: `${totalRevenue.toLocaleString()}đ`,
      icon: <Wallet className="w-6 h-6 text-purple-600" />,
      subtext: "Tổng giá trị đặt vé"
    },
  ];

  const filteredBookings = seats.filter((seat) => {
    if (!seat.user) return false;
    
    return (
      (filters.status === "all" || seat.bookingStatus === filters.status.toUpperCase()) &&
      (seat.user.email.toLowerCase().includes(filters.search.toLowerCase()) || !filters.search)
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 bg-gray-50 min-h-screen"
    >
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="ml-3 text-blue-600 font-medium">Đang tải thông tin chuyến xe...</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          {/* Header with Schedule Selector */}
          <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <BusFront className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-800">Chi tiết chuyến xe</h1>
              </div>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedScheduleId || ""}
                onChange={handleScheduleChange}
              >
                {schedules.map((schedule) => {
                  const departureDate = new Date(schedule.departureTime);
                  const formattedDate = departureDate.toLocaleDateString('vi-VN', { 
                    day: '2-digit', 
                    month: '2-digit'
                  });
                  const formattedTime = departureDate.toLocaleTimeString('vi-VN', { 
                    hour: '2-digit', 
                    minute: '2-digit'
                  });
                  const busNumber = schedule.bus?.busNumber || 'N/A';
                  
                  return (
                    <option key={schedule.scheduleId} value={schedule.scheduleId}>
                      {`${formattedDate} ${formattedTime} | ${schedule.route?.origin} → ${schedule.route?.destination} | Xe: ${busNumber}`}
                    </option>
                  );
                })}
              </select>
            </div>
            {selectedSchedule && (
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  <span>{new Date(selectedSchedule.departureTime).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(selectedSchedule.departureTime).toLocaleTimeString()}</span>
                </div>
                <StatusBadge status={selectedSchedule.status} />
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  </div>
                  <div className="p-3 rounded-full bg-gray-50">{stat.icon}</div>
                </div>
                <p className="text-sm text-gray-600">{stat.subtext}</p>
              </motion.div>
            ))}
          </div>

          {/* Filters */}
          <Formik>
            <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
              <h2 className="text-lg font-semibold mb-4">Bộ lọc</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <DatePickerField
                    name="date"
                    label="Ngày"
                    selected={filters.date}
                    onChange={(date) => setFilters({ ...filters, date })}
                    className="w-full"
                  />
                </div>
                <div>
                  <SelectField
                    name="status"
                    label="Trạng thái"
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    options={[
                      { value: "all", label: "Tất cả" },
                      { value: "confirmed", label: "Đã xác nhận" },
                      { value: "pending", label: "Chờ duyệt" },
                      { value: "cancelled", label: "Đã hủy" },
                    ]}
                    className="w-full"
                  />
                </div>
                <div>
                  <InputField
                    name="search"
                    label="Tìm kiếm"
                    placeholder="Email khách hàng..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </Formik>

          {/* Bus Layout Visualization */}
          <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
            <h2 className="text-lg font-semibold mb-6">Sơ đồ ghế</h2>
            <div className="bg-gray-50 p-8 rounded-lg">
              {/* Legend */}
              <div className="flex gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-400 rounded"></div>
                  <span className="text-sm">Còn trống</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm">Đã đặt</span>
                </div>
              </div>

              {/* Upper Deck */}
              <div className="mb-12">
                <h3 className="text-sm font-semibold mb-4">Tầng trên</h3>
                <div className="grid grid-cols-2 gap-8">
                  {upperDeckRows.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex flex-col gap-4">
                      {row.map((seat) => (
                        <Tooltip
                          key={seat.seatId}
                          content={
                            <div className="p-2">
                              {seat.user ? (
                                <>
                                  <p className="font-semibold">{seat.user.firstName} {seat.user.lastName}</p>
                                  <p className="text-sm text-gray-500">{seat.user.email}</p>
                                </>
                              ) : (
                                <p>Chưa có người đặt</p>
                              )}
                            </div>
                          }
                        >
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`
                              relative w-40 h-20 flex items-center justify-center 
                              rounded-xl shadow-sm cursor-pointer transition-all
                              ${seat.booked 
                                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                                : 'bg-green-400 hover:bg-green-500 text-white'
                              }
                            `}
                            onClick={() => handleSeatClick(seat.user)}
                          >
                            <span className="absolute top-2 left-2 text-sm font-medium">
                              #{seat.seatNumber}
                            </span>
                            <span className="text-sm font-medium">
                              {seat.booked ? 'Đã đặt' : 'Trống'}
                            </span>
                          </motion.div>
                        </Tooltip>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Lower Deck */}
              <div>
                <h3 className="text-sm font-semibold mb-4">Tầng dưới</h3>
                <div className="grid grid-cols-2 gap-8">
                  {lowerDeckRows.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex flex-col gap-4">
                      {row.map((seat) => (
                        <Tooltip
                          key={seat.seatId}
                          content={
                            <div className="p-2">
                              {seat.user ? (
                                <>
                                  <p className="font-semibold">{seat.user.firstName} {seat.user.lastName}</p>
                                  <p className="text-sm text-gray-500">{seat.user.email}</p>
                                </>
                              ) : (
                                <p>Chưa có người đặt</p>
                              )}
                            </div>
                          }
                        >
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`
                              relative w-40 h-20 flex items-center justify-center 
                              rounded-xl shadow-sm cursor-pointer transition-all
                              ${seat.booked 
                                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                                : 'bg-green-400 hover:bg-green-500 text-white'
                              }
                            `}
                            onClick={() => handleSeatClick(seat.user)}
                          >
                            <span className="absolute top-2 left-2 text-sm font-medium">
                              #{seat.seatNumber}
                            </span>
                            <span className="text-sm font-medium">
                              {seat.booked ? 'Đã đặt' : 'Trống'}
                            </span>
                          </motion.div>
                        </Tooltip>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
            <h2 className="text-lg font-semibold mb-6">Biểu đồ doanh thu</h2>
            <Chart
              type="line"
              data={{
                labels: seats.filter(s => s.booked).map((s) => new Date(s.bookingDate).toLocaleDateString()),
                datasets: [{
                  label: "Doanh thu",
                  data: seats.filter(s => s.booked).map((s) => s.price),
                  borderColor: "#3B82F6",
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  tension: 0.4,
                  fill: true
                }]
              }}
              options={{
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: "rgba(0, 0, 0, 0.05)"
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    }
                  }
                }
              }}
            />
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Danh sách đặt vé</h2>
            </div>
            <div className="overflow-x-auto">
              {filteredBookings.length > 0 ? (
                <Table
                  columns={[
                    { header: "Khách hàng", accessor: "userEmail" },
                    { header: "Số ghế", accessor: "seatNumber" },
                    {
                      header: "Trạng thái",
                      accessor: "status",
                      cell: (value) => <StatusBadge status={value} />
                    },
                    {
                      header: "Giá vé",
                      accessor: "totalPrice",
                      cell: (value) => `${(value || 0).toLocaleString()}đ`
                    },
                    { header: "Ngày đặt", accessor: "bookingDate" }
                  ]}
                  data={filteredBookings.map(seat => ({
                    userEmail: seat.user.email || 'N/A',
                    seatNumber: seat.seatNumber || 'N/A',
                    status: seat.bookingStatus || 'PENDING',
                    totalPrice: seat.price || 0,
                    bookingDate: seat.bookingDate ? 
                      new Date(seat.bookingDate).toLocaleDateString() : 'N/A'
                  }))}
                />
              ) : (
                <div className="py-20 text-center">
                  <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-lg font-medium">Chưa có đặt vé nào cho chuyến này</p>
                  <p className="text-gray-400 mt-1">Khi có khách đặt vé, thông tin sẽ hiển thị ở đây</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      <UserDetailModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        user={selectedUser}
      />
    </motion.div>
  );
};

export default ScheduleDetailPage;
