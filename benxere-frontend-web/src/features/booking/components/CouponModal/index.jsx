import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PercentIcon from '@mui/icons-material/Percent';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Input from '../../../../components/core/form-controls/input';
import Typography from '../../../../components/core/typography';
import '../BookingModal/styles.css';

const CouponModal = ({ isOpen, onClose, onSave, coupon }) => {
  const [formData, setFormData] = useState({
    code: '',
    discountPercentage: '',
    maxDiscountAmount: '',
    minBookingAmount: '',
    validFrom: '',
    validTo: '',
  });

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code || '',
        discountPercentage: coupon.discountPercentage || '',
        maxDiscountAmount: coupon.maxDiscountAmount || '',
        minBookingAmount: coupon.minBookingAmount || '',
        validFrom: coupon.validFrom || '',
        validTo: coupon.validTo || '',
      });
    } else {
      setFormData({
        code: '',
        discountPercentage: '',
        maxDiscountAmount: '',
        minBookingAmount: '',
        validFrom: '',
        validTo: '',
      });
    }
  }, [coupon]);

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-overlay">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="modal-content"
        >
          <div className="modal-header">
            <div className="flex items-center gap-2">
              <LocalOfferIcon className="text-primary-500 w-5 h-5" />
              <Typography variant="h6" className="font-semibold">
                {coupon ? 'Chỉnh Sửa Mã Giảm Giá' : 'Thêm Mã Giảm Giá'}
              </Typography>
            </div>
            <button onClick={onClose} className="modal-close-button">
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="modal-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="col-span-2">
                <div className="relative">
                  <LocalOfferIcon className="absolute left-3 top-[38px] text-gray-400 w-5 h-5" />
                  <Input
                    label="Mã giảm giá"
                    value={formData.code}
                    onChange={handleChange('code')}
                    className="pl-10"
                    required
                    size="small"
                  />
                </div>
              </div>

              <div className="relative">
                <PercentIcon className="absolute left-3 top-[38px] text-gray-400 w-5 h-5" />
                <Input
                  label="Phần trăm giảm"
                  type="number"
                  value={formData.discountPercentage}
                  onChange={handleChange('discountPercentage')}
                  className="pl-10"
                  required
                  size="small"
                />
              </div>

              <div className="relative">
                <AttachMoneyIcon className="absolute left-3 top-[38px] text-gray-400 w-5 h-5" />
                <Input
                  label="Số tiền giảm tối đa"
                  type="number"
                  value={formData.maxDiscountAmount}
                  onChange={handleChange('maxDiscountAmount')}
                  className="pl-10"
                  required
                  size="small"
                />
              </div>

              <div className="relative">
                <AttachMoneyIcon className="absolute left-3 top-[38px] text-gray-400 w-5 h-5" />
                <Input
                  label="Đơn hàng tối thiểu"
                  type="number"
                  value={formData.minBookingAmount}
                  onChange={handleChange('minBookingAmount')}
                  className="pl-10"
                  required
                  size="small"
                />
              </div>

              <div className="relative">
                <CalendarTodayIcon className="absolute left-3 top-[38px] text-gray-400 w-5 h-5" />
                <Input
                  label="Thời gian bắt đầu"
                  type="datetime-local"
                  value={formData.validFrom}
                  onChange={handleChange('validFrom')}
                  className="pl-10"
                  required
                  size="small"
                />
              </div>

              <div className="relative">
                <CalendarTodayIcon className="absolute left-3 top-[38px] text-gray-400 w-5 h-5" />
                <Input
                  label="Thời gian kết thúc"
                  type="datetime-local"
                  value={formData.validTo}
                  onChange={handleChange('validTo')}
                  className="pl-10"
                  required
                  size="small"
                />
              </div>
            </div>

            <div className="modal-footer mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 
                         hover:bg-gray-200 rounded-lg transition-colors"
              >
                Hủy bỏ
              </button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 
                         hover:bg-primary-700 rounded-lg ml-3 transition-colors"
              >
                {coupon ? 'Cập nhật' : 'Tạo mới'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

CouponModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  coupon: PropTypes.shape({
    code: PropTypes.string,
    discountPercentage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    maxDiscountAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    minBookingAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    validFrom: PropTypes.string,
    validTo: PropTypes.string,
  }),
};

export default CouponModal;