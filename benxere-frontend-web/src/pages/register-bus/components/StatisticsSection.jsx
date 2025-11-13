import React from 'react';

const StatisticsSection = () => {
  const statistics = [
    {
      value: '2000',
      label: 'Hãng xe',
      description: 'Đăng ký mở bán vé trên sàn Vexere'
    },
    {
      value: '5000',
      label: 'Tuyến đường',
      description: 'Đã được mở bán trên sàn Vexere'
    },
    {
      value: '10 Triệu',
      label: 'Khách',
      description: 'Đi thành công trên sàn Vexere'
    },
    {
      value: '5000',
      label: 'Đại lý',
      description: 'Trong và ngoài nước: Momo, Traveloka, Shopee...'
    }
  ];

  return (
    <section className="bg-white py-12">
      <div className="container mx-auto text-center">
        <h2 className="text-2xl font-bold mb-8">
          Sàn bán vé xe khách số 1 Việt Nam – Vexere.com qua những con số
        </h2>
        <div className="grid md:grid-cols-4 gap-8">
          {statistics.map((stat, index) => (
            <div key={index}>
              <h3 className="text-blue-600 text-3xl font-bold">{stat.value}</h3>
              <p>{stat.label}</p>
              <p className="text-sm text-gray-500">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatisticsSection;