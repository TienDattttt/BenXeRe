import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../components/core/button";
import Typography from "../components/core/typography";
import { PAYMENT_METHODS } from "../services/payment-service";

const BookingResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [bookingData, setBookingData] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(PAYMENT_METHODS.ZALOPAY);

  useEffect(() => {
    // Try to get booking data from location state or localStorage
    const data = location.state?.bookingData || JSON.parse(localStorage.getItem('lastBookingData') || '{}');
    setBookingData(data);
  }, [location.state]);

  const handleBackToHome = () => {
    navigate("/");
  };

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
  };

  const handleProceedToPayment = () => {
    // Here you would implement the logic to proceed with the selected payment method
    alert(`Processing payment with ${selectedPaymentMethod}`);
    // Navigate to payment processing page or open payment gateway
  };

  return (
    <div className="container m-auto min-h-[calc(100vh-136px)] py-10">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-3xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          <img src="/check-mark.svg" className="w-16 h-16 mb-4" alt="Success" />
          <Typography variant="h1" className="mb-2 text-center text-2xl font-bold text-primary">
            Đặt vé thành công!
          </Typography>
          <Typography className="text-center text-gray-600">
            Vui lòng kiểm tra email của bạn để nhận bản sao vé điện tử.
          </Typography>
        </div>

        {bookingData && (
          <div className="bg-slate-50 p-6 rounded-lg mb-8">
            <Typography variant="h2" className="text-xl font-semibold mb-4">
              Thông tin đặt vé
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Mã đặt vé</p>
                <p className="font-medium">{bookingData.bookingId || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Trạng thái</p>
                <p className="font-medium">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    Đã xác nhận
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tổng tiền</p>
                <p className="font-medium text-primary">
                  {bookingData.totalAmount ? 
                    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bookingData.totalAmount) : 
                    "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <Typography variant="h2" className="text-xl font-semibold mb-4">
            Chọn phương thức thanh toán
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md flex flex-col items-center ${selectedPaymentMethod === PAYMENT_METHODS.ZALOPAY ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
              onClick={() => handlePaymentMethodSelect(PAYMENT_METHODS.ZALOPAY)}
            >
              <img src="/payment-logos/zalopay.svg" alt="ZaloPay" className="h-12 mb-2" />
              <Typography className="font-medium">ZaloPay</Typography>
            </div>
            <div 
              className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md flex flex-col items-center ${selectedPaymentMethod === PAYMENT_METHODS.MOMO ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
              onClick={() => handlePaymentMethodSelect(PAYMENT_METHODS.MOMO)}
            >
              <div className="bg-[#ae2070] w-12 h-12 rounded-full flex items-center justify-center mb-2">
                <span className="text-white font-bold">Momo</span>
              </div>
              <Typography className="font-medium">Momo</Typography>
            </div>
            <div 
              className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md flex flex-col items-center ${selectedPaymentMethod === PAYMENT_METHODS.VNPAY ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
              onClick={() => handlePaymentMethodSelect(PAYMENT_METHODS.VNPAY)}
            >
              <div className="bg-[#0066b3] w-12 h-12 rounded-full flex items-center justify-center mb-2">
                <span className="text-white font-bold text-xs">VNPAY</span>
              </div>
              <Typography className="font-medium">VNPAY</Typography>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:justify-between gap-4">
          <Button
            className="secondary"
            onClick={() => handleBackToHome()}
          >
            Về trang chủ
          </Button>
          <Button
            className="primary"
            onClick={() => handleProceedToPayment()}
          >
            Tiếp tục thanh toán
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingResultPage;
