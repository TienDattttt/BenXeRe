import React, { useState, useEffect } from 'react';

const EmployeeModal = ({ isOpen, onClose, onSave, employee }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [role, setRole] = useState('');
    const [phone, setPhone] = useState('');

    useEffect(() => {
        if (employee) {
            setFirstName(employee.firstName);
            setLastName(employee.lastName);
            setRole(employee.role);
            setPhone(employee.phone);
        } else {
            setFirstName('');
            setLastName('');
            setRole('');
            setPhone('');
        }
    }, [employee]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const employeeData = { firstName, lastName, role, phone };
        onSave(employeeData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex justify-center items-center">
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative bg-white p-8 rounded-lg shadow-2xl w-1/2 z-10">
                <h2 className="text-2xl font-bold mb-4">{employee ? 'Edit Employee' : 'Add Employee'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">First Name</label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full px-4 py-2 border rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Last Name</label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full px-4 py-2 border rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-4 py-2 border rounded"
                            required
                        >
                            <option value="">Select Role</option>
                            <option value="STAFF">Nhân viên</option>
                            <option value="DRIVER">Tài xế</option>
                            <option value="ASSISTANT_DRIVER">Phụ xe</option>
                            <option value="CUSTOMER_CARE">Hướng dẫn viên</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Phone</label>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-4 py-2 border rounded"
                            required
                        />
                    </div>
                    <div className="flex justify-end">
                        <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded mr-2">
                            Cancel
                        </button>
                        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeModal;