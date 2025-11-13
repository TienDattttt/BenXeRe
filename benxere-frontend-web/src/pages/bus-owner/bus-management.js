import React, { useState, useEffect, lazy, Suspense } from "react";
import {getBusImageUrl} from "../../constants/common.js"
import Sidebar from "../../components/layouts/bus-owner/sidebar";
import { createBus, updateBus, deleteBus } from "../../services/bus-service";
import { getBusesByCurrentOwner } from "../../services/bus-owner/bus-owner-api";
import GlobalChatButton from "../../components/chat/global-chat-button";
const BusModal = lazy(() => import("../../components/bus-modal"));

const BusManagement = () => {
  const [buses, setBuses] = useState([]);
  const [isBusModalOpen, setIsBusModalOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");

  const handleSaveBus = async (busData, images) => {
    try {
      if (selectedBus) {
        await updateBus(selectedBus.busId, busData, images);
      } else {
        await createBus(busData, images);
      }
      const updatedBuses = await getBusesByCurrentOwner();
      setBuses(updatedBuses);
      setIsBusModalOpen(false);
    } catch (error) {
      console.error("Error saving bus:", error.response ? error.response.data : error.message);
    }
  };

  useEffect(() => {
    const fetchBuses = async () => {
      setLoading(true);
      try {
        const busResponse = await getBusesByCurrentOwner();
        setBuses(busResponse || []);
      } catch (error) {
        console.error("Error fetching buses:", error.response ? error.response.data : error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBuses();
  }, []);

  const handleAddBus = () => {
    setSelectedBus(null);
    setIsBusModalOpen(true);
  };

  const handleEditBus = (bus) => {
    setSelectedBus(bus);
    setIsBusModalOpen(true);
  };

  const handleDeleteBus = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa xe này không?")) {
      try {
        await deleteBus(id);
        setBuses(await getBusesByCurrentOwner());
      } catch (error) {
        console.error("Error deleting bus:", error.response ? error.response.data : error.message);
      }
    }
  };

  const getBusTypeStats = () => {
    return buses.reduce((acc, bus) => {
      acc[bus.busType] = (acc[bus.busType] || 0) + 1;
      return acc;
    }, {});
  };

  const filteredBuses = buses.filter(bus => {
    const matchesSearch = bus.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType ? bus.busType === filterType : true;
    return matchesSearch && matchesType;
  });

  const uniqueTypes = [...new Set(buses.map(bus => bus.busType))];
  const busTypeStats = getBusTypeStats();

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
        <div className="p-8 overflow-y-auto h-full">
          {/* Header with Stats */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Quản lý Xe</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-sm font-medium text-gray-500 mb-1">Tổng số xe</p>
                <p className="text-2xl font-bold text-gray-800">{buses.length}</p>
              </div>
              {Object.entries(busTypeStats).map(([type, count]) => (
                <div key={type} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <p className="text-sm font-medium text-gray-500 mb-1">Xe {type}</p>
                  <p className="text-2xl font-bold text-blue-600">{count}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tìm theo biển số hoặc tên công ty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại xe</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">Tất cả</option>
                  {uniqueTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="flex-none pt-6">
                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  onClick={handleAddBus}
                >
                  Thêm xe mới
                </button>
              </div>
            </div>
          </div>

          {/* Bus Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredBuses.map((bus) => (
              <div key={bus.busId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
                {/* Image Section */}
                <div className="w-full h-48 relative">
                  <img 
                    src={getBusImageUrl(bus.images && bus.images.length > 0 
                    ? bus.images[0].imageUrl
                    : null)}
                  alt={`${bus.busNumber}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/default-bus.jpg';
                  }}
                  />
                  {bus.images && bus.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                      +{bus.images.length - 1}
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{bus.busNumber}</h3>
                      <p className="text-sm text-gray-500">{bus.companyName}</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {bus.busType}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Sức chứa:</span>
                      <span className="font-medium text-gray-900">{bus.capacity} chỗ</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Chủ xe:</span>
                      <span className="font-medium text-gray-900">{bus.owner.firstName} {bus.owner.lastName}</span>
                    </div>
                    {bus.images && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Số lượng ảnh:</span>
                        <span className="font-medium text-gray-900">{bus.images.length}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                      onClick={() => handleEditBus(bus)}
                    >
                      Chỉnh sửa
                    </button>
                    <button
                      className="px-4 py-2 text-sm text-red-600 hover:text-red-800 font-medium"
                      onClick={() => handleDeleteBus(bus.busId)}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredBuses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Không tìm thấy xe nào</p>
            </div>
          )}
        </div>

        {/* Add GlobalChatButton */}
        <GlobalChatButton />

        {/* Bus Modal */}
        <Suspense fallback={<div className="text-center">Loading...</div>}>
          {isBusModalOpen && (
            <BusModal
              isOpen={isBusModalOpen}
              onClose={() => setIsBusModalOpen(false)}
              onSave={handleSaveBus}
              bus={selectedBus}
            />
          )}
        </Suspense>
      </div>
    </div>
  );
};

export default BusManagement;