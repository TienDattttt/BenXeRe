import React from 'react';

const SeatCard = ({ seatNumber, price, customer }) => {
  return (
    <div style={styles.card}>
      <h4>{seatNumber}</h4>
      <p>{customer}</p>
      <p>{price} VND</p>
    </div>
  );
};

const styles = {
  card: {
    background: '#f8f9fa',
    padding: '10px',
    margin: '10px',
    borderRadius: '5px',
    border: '1px solid #ddd',
    textAlign: 'center',
  },
};

export default SeatCard;
