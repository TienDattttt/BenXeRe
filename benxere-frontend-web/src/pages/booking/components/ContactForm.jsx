import React from 'react';

const ContactForm = ({ contactInfo, onChange }) => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Thông tin liên hệ</h2>
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Tên người đi *"
          className="w-full border p-2 rounded-md"
          value={contactInfo.name}
          onChange={(e) => onChange({ ...contactInfo, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Số điện thoại *"
          className="w-full border p-2 rounded-md"
          value={contactInfo.phone}
          onChange={(e) => onChange({ ...contactInfo, phone: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email để nhận thông tin đặt chỗ"
          className="w-full border p-2 rounded-md"
          value={contactInfo.email}
          onChange={(e) => onChange({ ...contactInfo, email: e.target.value })}
        />
        <p className="text-green-600 text-sm">
          Số điện thoại và email được sử dụng để gửi thông tin đơn hàng và
          liên hệ khi cần thiết.
        </p>
      </div>
    </div>
  );
};

export default ContactForm;