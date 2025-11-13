import React from 'react';

const TripDetails = () => {
  return (
    <div style={styles.details}>
      <div>
        <h3>Thông tin chuyến</h3>
        <p>
          <strong>Loại xe:</strong> Giường nằm 40 chỗ (Có WC)
        </p>
        <p>
          <strong>Tài xế:</strong> Nguyễn Ngọc Duy Anh (0987.654.321)
        </p>
        <p>
          <strong>Số xe:</strong> 29B1-123.45
        </p>
        <p>
          <strong>Ghi chú:</strong> Đây là text nhập cho phần ghi chú...
        </p>
      </div>
    </div>
  );
};

const styles = {
  details: {
    background: '#fff',
    padding: '20px',
    margin: '20px 0',
    borderRadius: '5px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
};

export default TripDetails;