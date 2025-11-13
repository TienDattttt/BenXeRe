import React, { useState } from 'react';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    route: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would normally send the data to an API
    console.log('Form submitted:', formData);
    alert('Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.');
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-bold">
          Họ và tên <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-bold">
          Số điện thoại liên hệ <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-bold">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-bold">
          Tỉnh (Thành phố) / Tuyến đường <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="route"
          value={formData.route}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-bold">
          Nội dung tư vấn
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
          rows="3"
        ></textarea>
      </div>
      <button 
        type="submit"
        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Gửi đăng ký
      </button>
    </form>
  );
};

export default RegistrationForm;