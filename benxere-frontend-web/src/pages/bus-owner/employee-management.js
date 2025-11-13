import React, { useState, useEffect, lazy, Suspense } from "react";
import SidebarLayout from "../../components/layouts/bus-owner/sidebar-layout";
import { getMyEmployees, createEmployee, updateEmployee } from "../../services/user-service";
import { Users, UserPlus, Search, Menu, ChevronDown, GridIcon, ListIcon, MessageSquare } from "lucide-react";
import EmployeeChat from "../../components/chat/EmployeeChat";

const EmployeeModal = lazy(() => import("../../components/employee-modal"));



const RoleBadge = ({ role }) => {
  const styles = {
    DRIVER: "bg-blue-100 text-blue-800 border-blue-200",
    ASSISTANT_DRIVER: "bg-purple-100 text-purple-800 border-purple-200",
    TOUR_GUIDE: "bg-orange-100 text-orange-800 border-orange-200",
    STAFF: "bg-teal-100 text-teal-800 border-teal-200"
  };
  const roleLabels = {
    DRIVER: "Tài xế",
    ASSISTANT_DRIVER: "Phụ xe",
    TOUR_GUIDE: "Hướng dẫn viên",
    STAFF: "Nhân viên",
    CUSTOMER_CARE: "CSKH"
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[role] || styles.STAFF}`}>
      {roleLabels[role] || role}
    </span>
  );
};

const EmployeeCard = ({ employee, onEdit }) => {
  const [showChat, setShowChat] = useState(false);
  const isCustomerCare = employee.role === "CUSTOMER_CARE";
  
  // Format work hours for display
  const formatTime = (timeString) => {
    if (!timeString) return "Chưa thiết lập";
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-lg">
              {employee.firstName?.[0] || '?'}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{employee.lastName || ''} {employee.firstName || ''}</h3>
            <p className="text-sm text-gray-500">{employee.email || ''}</p>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Vai trò:</span>
          <RoleBadge role={employee.role} />
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Điện thoại:</span>
          <span className="text-gray-900">{employee.phoneNumber}</span>
        </div>
       
        {/* Display work hours for Customer Care */}
        {isCustomerCare && (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Giờ bắt đầu:</span>
              <span className="text-gray-900">{formatTime(employee.workStartTime)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Giờ kết thúc:</span>
              <span className="text-gray-900">{formatTime(employee.workEndTime)}</span>
            </div>
          </>
        )}
      </div>
      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={() => setShowChat(true)}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2 text-sm font-medium"
        >
          <MessageSquare size={16} />
          <span>Chat</span>
        </button>
        <button
          onClick={() => onEdit(employee)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Chỉnh sửa
        </button>
      </div>
      <EmployeeChat
        open={showChat}
        onClose={() => setShowChat(false)}
        employee={employee}
      />
    </div>
  );
};

const EmployeeTable = ({ employees, onEdit }) => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showChat, setShowChat] = useState(false);

  // Format work hours for display
  const formatTime = (timeString) => {
    if (!timeString) return "Chưa thiết lập";
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  };

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Nhân viên</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Vai trò</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Liên hệ</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Chi nhánh</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Giờ làm việc</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Trạng thái</th>
            <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {employees.map((employee) => {
            const isCustomerCare = employee.role === "CUSTOMER_CARE";
            return (
              <tr key={employee.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-medium">{employee.firstName?.[0] || '?'}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{employee.firstName || ''} {employee.lastName || ''}</div>
                      <div className="text-sm text-gray-500">{employee.email || ''}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <RoleBadge role={employee.role} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{employee.phoneNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{employee.branch}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {isCustomerCare ? (
                    <span>
                      {formatTime(employee.workStartTime)} - {formatTime(employee.workEndTime)}
                    </span>
                  ) : (
                    <span>-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-4">
                    <button
                      onClick={() => onEdit(employee)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setShowChat(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-2 text-sm font-medium"
                    >
                      <MessageSquare size={16} />
                      <span>Chat</span>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {selectedEmployee && (
        <EmployeeChat
          open={showChat}
          onClose={() => {
            setShowChat(false);
            setSelectedEmployee(null);
          }}
          employee={selectedEmployee}
        />
      )}
    </div>
  );
};

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("grid");
  const [selectedRole, setSelectedRole] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getMyEmployees();
        console.log("Fetched employees:", response);
        setEmployees(response || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveEmployee = async (employeeData) => {
    try {
      if (selectedEmployee) {
        await updateEmployee(selectedEmployee.userId, employeeData);
        setEmployees(prevEmployees =>
          prevEmployees.map(emp =>
            emp.userId === selectedEmployee.userId ? { ...emp, ...employeeData } : emp
          )
        );
      } else {
        const newEmployee = await createEmployee(employeeData);
        setEmployees(prevEmployees => [...prevEmployees, newEmployee]);
      }
      setIsEmployeeModalOpen(false);
    } catch (error) {
      console.error("Error saving employee:", error);
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = searchTerm === '' || (
      (employee.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (employee.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (employee.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
    const matchesRole = selectedRole === "all" || employee.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const stats = [
    {
      title: "Tổng nhân viên",
      value: employees.length,
      icon: <Users className="w-6 h-6 text-blue-600" />
    },
    {
      title: "Tài xế",
      value: employees.filter(e => e.role === "DRIVER").length,
      icon: <Users className="w-6 h-6 text-green-600" />
    },
    {
      title: "Phụ xe",
      value: employees.filter(e => e.role === "ASSISTANT_DRIVER").length,
      icon: <Users className="w-6 h-6 text-purple-600" />
    },
    {
      title: "CSKH",
      value: employees.filter(e => e.role === "CUSTOMER_CARE").length,
      icon: <Users className="w-6 h-6 text-green-600" />
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderContent = () => (
    <div className="p-8 overflow-y-auto h-full">
      {/* Header with Stats */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Quản lý nhân viên</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm nhân viên..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="all">Tất cả vai trò</option>
              <option value="DRIVER">Tài xế</option>
              <option value="ASSISTANT_DRIVER">Phụ xe</option>
              <option value="TOUR_GUIDE">Hướng dẫn viên</option>
              <option value="CUSTOMER_CARE">CSKH</option>
              <option value="STAFF">Nhân viên</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("grid")}
              className={`p-2 rounded-lg ${view === "grid" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
            >
              <GridIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView("table")}
              className={`p-2 rounded-lg ${view === "table" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
            >
              <ListIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setSelectedEmployee(null);
                setIsEmployeeModalOpen(true);
              }}
              className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                <span>Thêm nhân viên</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Employee List */}
      {view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map(employee => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onEdit={employee => {
                setSelectedEmployee(employee);
                setIsEmployeeModalOpen(true);
              }}
            />
          ))}
        </div>
      ) : (
        <EmployeeTable
          employees={filteredEmployees}
          onEdit={employee => {
            setSelectedEmployee(employee);
            setIsEmployeeModalOpen(true);
          }}
        />
      )}
    </div>
  );

  return (
    <SidebarLayout>
      <div className="flex-1 overflow-hidden bg-gray-50">
        {renderContent()}
        
        {/* Employee Modal */}
        <Suspense fallback={<div className="text-center">Loading...</div>}>
          {isEmployeeModalOpen && (
            <EmployeeModal
              isOpen={isEmployeeModalOpen}
              onClose={() => setIsEmployeeModalOpen(false)}
              onSave={handleSaveEmployee}
              employee={selectedEmployee}
            />
          )}
        </Suspense>
      </div>
    </SidebarLayout>
  );
};

export default EmployeeManagement;