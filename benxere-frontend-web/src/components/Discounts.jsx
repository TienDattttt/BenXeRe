import React, { useState, useEffect } from "react";
import { getAllCoupons } from "../services/coupon-service";
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

const Discounts = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        const data = await getAllCoupons();
        const activeCoupons = data.filter(coupon => coupon.active);
        setCoupons(activeCoupons || []);
      } catch (err) {
        console.error("Error fetching coupons:", err);
        setError("Không thể tải danh sách mã giảm giá");
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '-';
    
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDiscount = (coupon) => {
    if (coupon.discountPercentage) {
      return `${coupon.discountPercentage}% ${coupon.maxDiscountAmount ? `(tối đa ${formatCurrency(coupon.maxDiscountAmount)})` : ''}`;
    }
    if (coupon.discountFixed) {
      return formatCurrency(coupon.discountFixed);
    }
    return '-';
  };

  if (loading) {
    return (
      <div className="mt-4 p-4 bg-white rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">Giảm giá</h3>
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 p-4 bg-white rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">Giảm giá</h3>
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-white rounded-lg shadow">
      <h3 className="text-xl font-bold mb-4">Giảm giá</h3>
      
      {coupons.length === 0 ? (
        <p className="text-gray-500">Hiện không có mã giảm giá nào có sẵn.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {coupons.map((coupon) => (
            <li key={coupon.couponId} className="py-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mr-4">
                  <LocalOfferIcon className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <p className="text-lg font-medium text-blue-700">{coupon.code}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(coupon.validTo).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <p className="text-sm text-gray-900 mt-1">
                    Giảm {formatDiscount(coupon)}
                  </p>
                  {coupon.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{coupon.description}</p>
                  )}
                  {coupon.minBookingAmount > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      Đơn tối thiểu: {formatCurrency(coupon.minBookingAmount)}
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Discounts;