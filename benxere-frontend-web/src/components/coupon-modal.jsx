import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

const CouponModal = ({ isOpen, onClose, onSave, coupon }) => {
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage', 
    discountPercentage: '',
    discountFixed: '',
    minBookingAmount: '',
    maxDiscountAmount: '',
    validFrom: '',
    validTo: '',
    active: true,
    usageLimit: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (coupon) {
      const discountType = coupon.discountPercentage !== null && coupon.discountPercentage !== undefined
        ? 'percentage'
        : 'fixed';
      
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
          const date = new Date(dateString);
          return date.toISOString().slice(0, 16);
        } catch (error) {
          return '';
        }
      };

      setFormData({
        code: coupon.code || '',
        description: coupon.description || '',
        discountType,
        discountPercentage: coupon.discountPercentage || '',
        discountFixed: coupon.discountFixed || '',
        minBookingAmount: coupon.minBookingAmount || '',
        maxDiscountAmount: coupon.maxDiscountAmount || '',
        validFrom: formatDateForInput(coupon.validFrom),
        validTo: formatDateForInput(coupon.validTo),
        active: coupon.active !== false,
        usageLimit: coupon.usageLimit || '',
      });
    } else {
      const now = new Date();
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      setFormData({
        code: '',
        description: '',
        discountType: 'percentage',
        discountPercentage: '',
        discountFixed: '',
        minBookingAmount: '',
        maxDiscountAmount: '',
        validFrom: now.toISOString().slice(0, 16),
        validTo: nextMonth.toISOString().slice(0, 16),
        active: true,
        usageLimit: '',
      });
    }
  }, [coupon, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.code || formData.code.trim() === '') {
      newErrors.code = 'Mã giảm giá không được để trống';
    }
    
    if (formData.discountType === 'percentage') {
      if (!formData.discountPercentage) {
        newErrors.discountPercentage = 'Phần trăm giảm giá không được để trống';
      } else if (parseInt(formData.discountPercentage) <= 0 || parseInt(formData.discountPercentage) > 100) {
        newErrors.discountPercentage = 'Phần trăm giảm giá phải từ 1% đến 100%';
      }
    } else {
      if (!formData.discountFixed) {
        newErrors.discountFixed = 'Số tiền giảm không được để trống';
      } else if (parseFloat(formData.discountFixed) <= 0) {
        newErrors.discountFixed = 'Số tiền giảm phải lớn hơn 0';
      }
    }
    
    if (!formData.validFrom) {
      newErrors.validFrom = 'Vui lòng chọn ngày bắt đầu';
    }
    
    if (!formData.validTo) {
      newErrors.validTo = 'Vui lòng chọn ngày kết thúc';
    } else if (new Date(formData.validFrom) >= new Date(formData.validTo)) {
      newErrors.validTo = 'Ngày kết thúc phải sau ngày bắt đầu';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare data for API
      const couponData = {
        code: formData.code,
        description: formData.description || null,
        discountPercentage: formData.discountType === 'percentage' ? parseInt(formData.discountPercentage) : null,
        discountFixed: formData.discountType === 'fixed' ? parseFloat(formData.discountFixed) : null,
        minBookingAmount: formData.minBookingAmount ? parseFloat(formData.minBookingAmount) : null,
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
        validFrom: formData.validFrom,
        validTo: formData.validTo,
        active: formData.active,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
      };
      
      await onSave(couponData);
      onClose();
    } catch (error) {
      console.error('Error saving coupon:', error);
      setErrors((prev) => ({ ...prev, form: 'Đã xảy ra lỗi khi lưu mã giảm giá' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-4">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-4 z-50"
          >
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b">
              <div className="flex items-center">
                <LocalOfferIcon className="text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold">
                  {coupon ? 'Chỉnh sửa mã giảm giá' : 'Thêm mã giảm giá mới'}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <CloseIcon />
              </button>
            </div>
            
            {/* Body */}
            <div className="py-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {errors.form && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                    {errors.form}
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mã giảm giá <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded-md ${errors.code ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Nhập mã giảm giá (VD: SUMMER2023)"
                      />
                      {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mô tả
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        rows="2"
                        placeholder="Mô tả về mã giảm giá"
                      ></textarea>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Loại giảm giá <span className="text-red-600">*</span>
                      </label>
                      <select
                        name="discountType"
                        value={formData.discountType}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="percentage">Giảm theo phần trăm (%)</option>
                        <option value="fixed">Giảm theo số tiền cố định (VND)</option>
                      </select>
                    </div>
                    
                    <div>
                      {formData.discountType === 'percentage' ? (
                        <>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phần trăm giảm giá (%) <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="number"
                            name="discountPercentage"
                            value={formData.discountPercentage}
                            onChange={handleChange}
                            min="1"
                            max="100"
                            className={`w-full p-2 border rounded-md ${errors.discountPercentage ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Nhập phần trăm giảm giá"
                          />
                          {errors.discountPercentage && <p className="mt-1 text-sm text-red-600">{errors.discountPercentage}</p>}
                        </>
                      ) : (
                        <>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Số tiền giảm (VND) <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="number"
                            name="discountFixed"
                            value={formData.discountFixed}
                            onChange={handleChange}
                            min="0"
                            className={`w-full p-2 border rounded-md ${errors.discountFixed ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Nhập số tiền giảm giá"
                          />
                          {errors.discountFixed && <p className="mt-1 text-sm text-red-600">{errors.discountFixed}</p>}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giá trị đơn hàng tối thiểu (VND)
                      </label>
                      <input
                        type="number"
                        name="minBookingAmount"
                        value={formData.minBookingAmount}
                        onChange={handleChange}
                        min="0"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Không giới hạn"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số tiền giảm tối đa (VND)
                      </label>
                      <input
                        type="number"
                        name="maxDiscountAmount"
                        value={formData.maxDiscountAmount}
                        onChange={handleChange}
                        min="0"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Không giới hạn"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày bắt đầu <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        name="validFrom"
                        value={formData.validFrom}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded-md ${errors.validFrom ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.validFrom && <p className="mt-1 text-sm text-red-600">{errors.validFrom}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày kết thúc <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        name="validTo"
                        value={formData.validTo}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded-md ${errors.validTo ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.validTo && <p className="mt-1 text-sm text-red-600">{errors.validTo}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giới hạn sử dụng
                      </label>
                      <input
                        type="number"
                        name="usageLimit"
                        value={formData.usageLimit}
                        onChange={handleChange}
                        min="0"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Không giới hạn"
                      />
                      <p className="text-xs text-gray-500 mt-1">Để trống nếu không giới hạn số lần sử dụng</p>
                    </div>
                    
                    <div className="flex items-center h-full pt-6">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="active"
                          checked={formData.active}
                          onChange={handleChange}
                          className="mr-2 h-4 w-4 text-blue-600 rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">Kích hoạt mã giảm giá</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    disabled={isSubmitting}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Đang xử lý...' : (coupon ? 'Cập nhật' : 'Tạo mã')}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default CouponModal;