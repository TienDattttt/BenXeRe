import React from 'react';

const Header = () => {
  return (
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
  );
};

export default Header;