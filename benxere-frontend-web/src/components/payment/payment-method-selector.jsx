import React from 'react';
import { PAYMENT_METHODS } from '../../services/payment-service';

const paymentMethodDetails = {
  [PAYMENT_METHODS.ZALOPAY]: {
    name: 'ZaloPay',
    logo: 'https://cdn.moveek.com/bundles/ornweb/partners/zalopay-icon.png',
    description: 'Thanh toán nhanh chóng với ví điện tử ZaloPay',
    benefits: ['Miễn phí giao dịch', 'Xử lý tức thì', 'Bảo mật cao'],
  },
  [PAYMENT_METHODS.MOMO]: {
    name: 'Momo',
    logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Square-1024x1024.png',
    description: 'Thanh toán an toàn qua ví điện tử Momo',
    benefits: ['Hoàn tiền hấp dẫn', 'Bảo mật đa lớp', 'Giao dịch nhanh'],
  },
  [PAYMENT_METHODS.VNPAY]: {
    name: 'VNPay',
    logo: 'https://vinadesign.vn/uploads/images/2023/05/vnpay-logo-vinadesign-25-12-57-55.jpg',
    description: 'Thanh toán linh hoạt qua cổng VNPay',
    benefits: ['Hỗ trợ nhiều ngân hàng', 'An toàn tuyệt đối', 'Xác thực nhanh'],
  },
};

const PaymentMethodSelector = ({ selectedMethod, onMethodSelect }) => {
  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {Object.values(PAYMENT_METHODS).map((method) => {
          const details = paymentMethodDetails[method];
          
          if (!details) {
            console.warn(`Không tìm thấy thông tin cho phương thức: ${method}`);
            return null;
          }
          
          return (
            <div
              key={method}
              className={`group relative p-4 rounded-lg cursor-pointer transition-all duration-300
                ${selectedMethod === method 
                  ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-500 shadow-md' 
                  : 'bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-md'
                }`}
              onClick={() => onMethodSelect(method)}
            >
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg bg-white p-2 
                  border border-gray-100 transition-transform group-hover:scale-105">
                  <img
                    src={details.logo}
                    alt={details.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/64';
                      e.target.onerror = null;
                    }}
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-800">{details.name}</h4>
                    <input
                      type="radio"
                      checked={selectedMethod === method}
                      onChange={() => onMethodSelect(method)}
                      className="w-5 h-5 text-blue-600 transition-all duration-300 
                        focus:ring-blue-500 focus:ring-offset-0"
                    />
                  </div>
                  <p className="text-gray-600 mt-1">{details.description}</p>
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    {details.benefits.map((benefit, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {selectedMethod === method && (
                <div className="absolute top-2 right-2">
                  <div className="bg-blue-500 text-white p-1 rounded-full shadow-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
