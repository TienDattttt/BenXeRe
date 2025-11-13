import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layouts/admin/admin-layout';
import { getAllCoupons, createCoupon, updateCoupon, deleteCoupon } from '../../services/coupon-service';
import CouponModal from '../../components/coupon-modal';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setIsLoading(true);
        const data = await getAllCoupons();
        setCoupons(data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching coupons:", err);
        setError("Không thể tải danh sách mã giảm giá. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  const handleAddCoupon = () => {
    setSelectedCoupon(null);
    setIsModalOpen(true);
  };

  const handleEditCoupon = (coupon) => {
    setSelectedCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleSaveCoupon = async (couponData) => {
    try {
      setIsLoading(true);
      if (selectedCoupon) {
        await updateCoupon(selectedCoupon.couponId, couponData);
      } else {
        await createCoupon(couponData);
      }
      const updatedCoupons = await getAllCoupons();
      setCoupons(updatedCoupons || []);
      setIsModalOpen(false);
      setError(null);
    } catch (err) {
      console.error("Error saving coupon:", err);
      setError(selectedCoupon 
        ? "Không thể cập nhật mã giảm giá. Vui lòng thử lại sau." 
        : "Không thể tạo mã giảm giá. Vui lòng thử lại sau."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa mã giảm giá này?")) {
      return;
    }
    
    try {
      setIsLoading(true);
      await deleteCoupon(id);
      const updatedCoupons = await getAllCoupons();
      setCoupons(updatedCoupons || []);
      setError(null);
    } catch (err) {
      console.error("Error deleting coupon:", err);
      setError("Không thể xóa mã giảm giá. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  // Format currency display
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '-';
    
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      return new Date(dateString).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '-';
    }
  };

  // Format discount display
  const formatDiscount = (coupon) => {
    if (coupon.discountPercentage) {
      return `${coupon.discountPercentage}%`;
    }
    if (coupon.discountFixed) {
      return formatCurrency(coupon.discountFixed);
    }
    return '-';
  };

  return (
    <AdminLayout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Quản lý mã giảm giá</h1>
          <button 
            onClick={handleAddCoupon} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Đang xử lý...' : 'Thêm mã giảm giá'}
          </button>
        </div>

        {error && (
          <div className="p-4 mb-4 bg-red-50 text-red-700 rounded-md border border-red-200">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giảm giá</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn tối thiểu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giảm tối đa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tình trạng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lượt dùng</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading && !coupons.length ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : coupons.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                      Chưa có mã giảm giá nào.
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr key={coupon.couponId} className={!coupon.active ? 'bg-gray-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{coupon.code}</div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="text-sm text-gray-500 truncate">{coupon.description || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDiscount(coupon)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(coupon.minBookingAmount)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(coupon.maxDiscountAmount)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-500">
                          <div>Từ: {formatDate(coupon.validFrom)}</div>
                          <div>Đến: {formatDate(coupon.validTo)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {coupon.active ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Kích hoạt
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Vô hiệu
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {coupon.usageCount || 0} / {coupon.usageLimit || '∞'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleEditCoupon(coupon)} 
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          disabled={isLoading}
                        >
                          Sửa
                        </button>
                        <button 
                          onClick={() => handleDeleteCoupon(coupon.couponId)} 
                          className="text-red-600 hover:text-red-900"
                          disabled={isLoading}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CouponModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCoupon}
        coupon={selectedCoupon}
      />
    </AdminLayout>
  );
};

export default Coupons;