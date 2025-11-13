import React from 'react';

const FeaturesSection = () => {
  const features = [
    {
      value: '99.8%',
      description: 'Tỷ lệ khách đặt vé mà không đi qua sàn Vexere rất thấp chỉ 0.2%',
      image: null
    },
    {
      value: null,
      description: 'Quy trình đối soát, thanh toán công nợ đúng hạn với chủ nhà xe',
      image: 'https://via.placeholder.com/80'
    },
    {
      value: null,
      description: 'Được hỗ trợ tận tình từ đội ngũ chuyên viên Vexere trong suốt quá trình',
      image: 'https://via.placeholder.com/80'
    }
  ];

  return (
    <section className="bg-gray-100 py-12">
      <div className="container mx-auto text-center">
        <h2 className="text-2xl font-bold mb-8">
          Sự an tâm của Chủ nhà xe là ưu tiên hàng đầu của Vexere
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index}>
              {feature.value && (
                <div className="text-5xl font-bold text-blue-600">{feature.value}</div>
              )}
              {feature.image && (
                <img
                  src={feature.image}
                  alt={`Feature ${index + 1}`}
                  className="mx-auto mb-4"
                />
              )}
              <p className="mt-4">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;