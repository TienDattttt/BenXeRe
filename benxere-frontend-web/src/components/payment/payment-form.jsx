import React from 'react';
import PaymentMethodSelector from './payment-method-selector';

const PaymentForm = ({ selectedMethod, onSelectPaymentMethod, amount }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Thanh toán</h2>
        <p className="text-gray-600 mt-1">Chọn phương thức thanh toán phù hợp</p>
      </div>

      {amount && (
        <div className="bg-blue-50 rounded-lg p-4 flex items-center justify-between">
          <span className="text-gray-700 font-medium">Tổng thanh toán:</span>
          <span className="text-2xl font-bold text-blue-600">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(amount)}
          </span>
        </div>
      )}

      <PaymentMethodSelector
        selectedMethod={selectedMethod}
        onMethodSelect={onSelectPaymentMethod}
      />

      <div className="bg-gray-50 rounded-lg p-4 mt-4">
        <div className="flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-gray-900">Lưu ý về thanh toán</h4>
            <p className="mt-1 text-sm text-gray-600">
              Vui lòng kiểm tra kỹ thông tin trước khi thanh toán. Sau khi xác nhận, 
              bạn sẽ được chuyển đến cổng thanh toán an toàn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;