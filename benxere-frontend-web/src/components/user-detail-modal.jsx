import React from "react";
import Modal from "react-modal";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HomeIcon from '@mui/icons-material/Home';
import Typography from './core/typography';
import '../styles/modal.css';

Modal.setAppElement("#root");

const formatDateForVietnamese = (dateString) => {
  if (!dateString) return 'Không có thông tin';
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return 'Không hợp lệ';
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const UserDetailModal = ({ isOpen, onRequestClose, user }) => {
  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="modal-content admin-modal max-w-2xl"
          >
            <div className="modal-header">
              <div className="modal-header-title">
                <PersonIcon className="modal-header-icon" />
                <Typography variant="h6" className="font-semibold">
                  Thông Tin Khách Hàng
                </Typography>
              </div>
              <button onClick={onRequestClose} className="modal-close-button">
                <IoClose className="w-5 h-5" />
              </button>
            </div>

            <div className="modal-body">
              <div className="bg-indigo-50 p-6 rounded-lg mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                    <PersonIcon className="text-indigo-600 w-8 h-8" />
                  </div>
                  <div>
                    <Typography variant="h5" className="font-semibold text-slate-800">
                      {user.firstName} {user.lastName}
                    </Typography>
                    <Typography className="text-slate-600 flex items-center">
                      <EmailIcon className="w-4 h-4 mr-1" /> {user.email || 'N/A'}
                    </Typography>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                    <Typography variant="subtitle2" className="text-slate-500 mb-2">Thông Tin Liên Lạc</Typography>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <PhoneIcon className="text-indigo-500 w-5 h-5 mr-3" />
                        <div>
                          <div className="font-medium text-slate-700">Số Điện Thoại</div>
                          <div>{user.phoneNumber || 'Chưa cung cấp'}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <EmailIcon className="text-indigo-500 w-5 h-5 mr-3" />
                        <div>
                          <div className="font-medium text-slate-700">Email</div>
                          <div>{user.email || 'Chưa cung cấp'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                    <Typography variant="subtitle2" className="text-slate-500 mb-2">Tài Khoản</Typography>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <AssignmentIndIcon className="text-indigo-500 w-5 h-5 mr-3" />
                        <div>
                          <div className="font-medium text-slate-700">User ID</div>
                          <div className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">
                            {user.id || 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <CalendarTodayIcon className="text-indigo-500 w-5 h-5 mr-3" />
                        <div>
                          <div className="font-medium text-slate-700">Ngày Đăng Ký</div>
                          <div>{formatDateForVietnamese(user.createdAt)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                    <Typography variant="subtitle2" className="text-slate-500 mb-2">Thông Tin Cá Nhân</Typography>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <PersonIcon className="text-indigo-500 w-5 h-5 mr-3" />
                        <div>
                          <div className="font-medium text-slate-700">Họ và Tên</div>
                          <div>{user.lastName} {user.firstName || 'Chưa cung cấp'}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <HomeIcon className="text-indigo-500 w-5 h-5 mr-3" />
                        <div>
                          <div className="font-medium text-slate-700">Địa Chỉ</div>
                          <div>{user.address || 'Chưa cung cấp'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional info can be added here */}
                  <div className="bg-white p-4 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                    <Typography variant="subtitle2" className="text-slate-500 mb-2">Thống Kê Đặt Vé</Typography>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-green-50 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">{user.bookingsCount || 0}</div>
                        <div className="text-xs text-green-700">Tổng Đặt Vé</div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">{user.activeBookingsCount || 0}</div>
                        <div className="text-xs text-blue-700">Vé Đang Hoạt Động</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                onClick={onRequestClose} 
                className="btn btn-primary w-full sm:w-auto"
              >
                Đóng
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UserDetailModal;