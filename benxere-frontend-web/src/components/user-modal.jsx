import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import LockIcon from '@mui/icons-material/Lock';
import Typography from './core/typography';
import Input from './core/form-controls/input';
import '../styles/modal.css';

const UserModal = ({ isOpen, onClose, onSave, user, roles = [] }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setPhoneNumber(user.phoneNumber || '');
      setPassword('');
      
      if (user.role && roles.length > 0) {
        const foundIndex = roles.findIndex(role => role.name === user.role);
        setRoleId(foundIndex !== -1 ? String(foundIndex + 1) : '1'); 
      } else {
        setRoleId('1'); // Default to CUSTOMER (ID: 1)
      }
    } else {
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhoneNumber('');
      setPassword('');
      setRoleId('1'); // Default to CUSTOMER
    }
  }, [user, roles]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const userData = { 
      firstName, 
      lastName, 
      email, 
      phoneNumber,
      roleId
    };
    
    // Only include password if it's set (for updates)
    if (password) {
      userData.password = password;
    }
    
    onSave(userData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-overlay">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="modal-content admin-modal"
        >
          <div className="modal-header">
            <div className="modal-header-title">
              <PersonIcon className="modal-header-icon" />
              <Typography variant="h6" className="font-semibold">
                {user ? 'Chỉnh Sửa Người Dùng' : 'Thêm Người Dùng Mới'}
              </Typography>
            </div>
            <button onClick={onClose} className="modal-close-button">
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>

          <form id="user-form" onSubmit={handleSubmit} className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <div className="input-group">
                  <PersonIcon className="input-group-icon" />
                  <Input
                    label="Họ"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="form-input"
                    required
                    size="small"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="input-group">
                  <PersonIcon className="input-group-icon" />
                  <Input
                    label="Tên"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="form-input"
                    required
                    size="small"
                  />
                </div>
              </div>

              <div className="form-grid-full">
                <div className="input-group">
                  <EmailIcon className="input-group-icon" />
                  <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    required
                    size="small"
                  />
                </div>
              </div>

              <div className="form-grid-full">
                <div className="input-group">
                  <PhoneIcon className="input-group-icon" />
                  <Input
                    label="Số điện thoại"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="form-input"
                    required
                    size="small"
                  />
                </div>
              </div>

              <div className="form-grid-full">
                <div className="input-group">
                  <BadgeIcon className="input-group-icon" />
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                    <select
                      value={roleId}
                      onChange={(e) => setRoleId(e.target.value)}
                      className="form-select"
                      required
                      aria-label="Vai trò người dùng"
                    >
                      <option value="" disabled>Chọn vai trò</option>
                      {roles.map((role, index) => (
                        <option key={index + 1} value={index + 1}>
                          {role.name} - {role.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-grid-full">
                <div className="input-group">
                  <LockIcon className="input-group-icon" />
                  <Input
                    label={user ? "Mật khẩu mới (để trống nếu không thay đổi)" : "Mật khẩu"}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    required={!user}
                    size="small"
                  />
                </div>
              </div>
            </div>

            {roles.length === 0 && (
              <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-md">
                <p className="text-sm">Không thể tải danh sách vai trò. Xin vui lòng thử lại sau.</p>
              </div>
            )}
          </form>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Hủy bỏ
            </button>
            <motion.button
              type="submit"
              form="user-form"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn btn-primary"
              disabled={roles.length === 0}
            >
              {user ? 'Cập nhật' : 'Lưu'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UserModal;