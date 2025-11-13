import React, { useState, useEffect } from 'react';
import { TextField } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { vi } from 'date-fns/locale';

const EmployeeModal = ({ isOpen, onClose, onSave, employee }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [roleId, setRoleId] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [workStartTime, setWorkStartTime] = useState(null);
    const [workEndTime, setWorkEndTime] = useState(null);
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (employee) {
            setFirstName(employee.firstName || '');
            setLastName(employee.lastName || '');
            setRoleId(employee.role === 'CUSTOMER_CARE' ? '9' : employee.roleId || '');
            setPhoneNumber(employee.phoneNumber || '');
            setEmail(employee.email || '');
            
            if (employee.workStartTime) {
                const [hours, minutes] = employee.workStartTime.split(':');
                const date = new Date();
                date.setHours(parseInt(hours, 10));
                date.setMinutes(parseInt(minutes, 10));
                setWorkStartTime(date);
            } else {
                if (employee.role === 'CUSTOMER_CARE') {
                    const defaultStart = new Date();
                    defaultStart.setHours(8);
                    defaultStart.setMinutes(0);
                    setWorkStartTime(defaultStart);
                } else {
                    setWorkStartTime(null);
                }
            }
            
            if (employee.workEndTime) {
                const [hours, minutes] = employee.workEndTime.split(':');
                const date = new Date();
                date.setHours(parseInt(hours, 10));
                date.setMinutes(parseInt(minutes, 10));
                setWorkEndTime(date);
            } else {
                // Set default end time (17:00 PM) for CUSTOMER_CARE with null workEndTime
                if (employee.role === 'CUSTOMER_CARE') {
                    const defaultEnd = new Date();
                    defaultEnd.setHours(17);
                    defaultEnd.setMinutes(0);
                    setWorkEndTime(defaultEnd);
                } else {
                    setWorkEndTime(null);
                }
            }
        } else {
            setFirstName('');
            setLastName('');
            setRoleId('');
            setPhoneNumber('');
            setWorkStartTime(null);
            setWorkEndTime(null);
            setEmail('');
        }
    }, [employee]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const employeeData = { 
            firstName, 
            lastName, 
            roleId, 
            phoneNumber,
            email
        };

        // Add workStartTime and workEndTime for CUSTOMER_CARE role
        if (roleId === '9') {
            // Format to HH:MM:SS
            const formatTime = (date) => {
                if (!date) return null;
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                return `${hours}:${minutes}:00`;
            };
            
            employeeData.workStartTime = formatTime(workStartTime);
            employeeData.workEndTime = formatTime(workEndTime);
        }
        
        onSave(employeeData);
    };

    if (!isOpen) return null;

    // Check if the role is CUSTOMER_CARE
    const isCustomerCare = roleId === '9' || employee?.role === 'CUSTOMER_CARE';

    return (
        <div className="fixed inset-0 flex justify-center items-center">
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative bg-white p-8 rounded-lg shadow-2xl w-1/2 z-10">
                <h2 className="text-2xl font-bold mb-4">{employee ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Họ</label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full px-4 py-2 border rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Tên</label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full px-4 py-2 border rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Vai trò</label>
                        <select
                            value={roleId}
                            onChange={(e) => setRoleId(e.target.value)}
                            className="w-full px-4 py-2 border rounded"
                            required
                        >
                            <option value="">Chọn vai trò</option>
  <option value="5">Tài xế</option>            
  <option value="6">Phụ xe</option>            
  <option value="7">Nhân viên</option>         
  <option value="8">CSKH</option>   
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Số điện thoại</label>
                        <input
                            type="text"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full px-4 py-2 border rounded"
                            required
                        />
                    </div>
                    
                    {/* Work time fields for CUSTOMER_CARE role */}
                    {isCustomerCare && (
                        <LocalizationProvider dateAdapter={AdapterDateFns} locale={vi}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Giờ bắt đầu làm việc</label>
                                <TimePicker
                                    value={workStartTime}
                                    onChange={setWorkStartTime}
                                    slotProps={{ 
                                        textField: { 
                                            fullWidth: true,
                                            required: true,
                                            className: "bg-white"
                                        } 
                                    }}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Giờ kết thúc làm việc</label>
                                <TimePicker
                                    value={workEndTime}
                                    onChange={setWorkEndTime}
                                    slotProps={{ 
                                        textField: { 
                                            fullWidth: true,
                                            required: true,
                                            className: "bg-white"
                                        } 
                                    }}
                                />
                            </div>
                        </LocalizationProvider>
                    )}
                    
                    <div className="flex justify-end">
                        <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded mr-2">
                            Hủy
                        </button>
                        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                            Lưu
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeModal;