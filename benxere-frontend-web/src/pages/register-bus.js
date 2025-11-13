import React from "react";

function RegisterBus() {
  return (
    <div className="bg-gray-100">
      {/* Header */}
      <header className="bg-blue-900 text-white px-4 py-3">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <img
              src="https://via.placeholder.com/40"
              alt="Vexere Logo"
              className="mr-2"
            />
            <span className="text-lg font-bold">Vexere</span>
          </div>
          <div className="flex space-x-6 text-sm">
            <div>
              <strong>Miền Bắc</strong>: Mr. Trọng: 0988 957 866
            </div>
            <div>
              <strong>Miền Nam</strong>: Mr. Thuận: 0357 949 989
            </div>
            <button className="bg-yellow-400 text-blue-900 px-4 py-1 rounded">
              Dùng thử miễn phí
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
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
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-bold">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-bold">
                  Số điện thoại liên hệ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-bold">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-bold">
                  Tỉnh (Thành phố) / Tuyến đường <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-bold">
                  Nội dung tư vấn
                </label>
                <textarea
                  className="w-full px-4 py-2 border rounded"
                  rows="3"
                ></textarea>
              </div>
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Gửi đăng ký
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-white py-12">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl font-bold mb-8">
            Sàn bán vé xe khách số 1 Việt Nam – Vexere.com qua những con số
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-blue-600 text-3xl font-bold">2000</h3>
              <p>Hãng xe</p>
              <p className="text-sm text-gray-500">
                Đăng ký mở bán vé trên sàn Vexere
              </p>
            </div>
            <div>
              <h3 className="text-blue-600 text-3xl font-bold">5000</h3>
              <p>Tuyến đường</p>
              <p className="text-sm text-gray-500">
                Đã được mở bán trên sàn Vexere
              </p>
            </div>
            <div>
              <h3 className="text-blue-600 text-3xl font-bold">10 Triệu</h3>
              <p>Khách</p>
              <p className="text-sm text-gray-500">
                Đi thành công trên sàn Vexere
              </p>
            </div>
            <div>
              <h3 className="text-blue-600 text-3xl font-bold">5000</h3>
              <p>Đại lý</p>
              <p className="text-sm text-gray-500">
                Trong và ngoài nước: Momo, Traveloka, Shopee...
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-100 py-12">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl font-bold mb-8">
            Sự an tâm của Chủ nhà xe là ưu tiên hàng đầu của Vexere
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-5xl font-bold text-blue-600">99.8%</div>
              <p className="mt-4">
                Tỷ lệ khách đặt vé mà không đi qua sàn Vexere rất thấp chỉ 0.2%
              </p>
            </div>
            <div>
              <img
                src="https://via.placeholder.com/80"
                alt="Process Icon"
                className="mx-auto mb-4"
              />
              <p>
                Quy trình đối soát, thanh toán công nợ đúng hạn với chủ nhà xe
              </p>
            </div>
            <div>
              <img
                src="https://via.placeholder.com/80"
                alt="Support Icon"
                className="mx-auto mb-4"
              />
              <p>
                Được hỗ trợ tận tình từ đội ngũ chuyên viên Vexere trong suốt quá
                trình
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default RegisterBus;