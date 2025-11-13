import React from 'react';
import RegistrationForm from './RegistrationForm';

const HeroSection = () => {
  return (
    <section className="bg-blue-500 text-white py-16">
      <div className="container mx-auto grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl font-bold leading-snug">
            Tăng 30% lượng khách đặt vé khi mở bán online trên Vexere.com ngay
            hôm nay!
          </h1>
          <p className="mt-4 text-lg">
            Đăng ký miễn phí và chỉ mất 1 phút để hoàn tất
          </p>
        </div>
        <div className="bg-white text-blue-900 p-8 rounded shadow-md">
          <h2 className="text-xl font-bold mb-4">
            Bắt đầu lấp đầy chỗ trống trên xe của bạn với hơn 10 triệu lượt
            khách đi thành công trên Vexere
          </h2>
          <RegistrationForm />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;