import React from 'react';

const Card = ({ title, value, change }) => {
  return (
    <div style={styles.card}>
      <h3>{title}</h3>
      <p style={styles.value}>{value}</p>
      <p style={styles.change}>{change}</p>
    </div>
  );
};

const styles = {
  card: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    background: '#fff',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  value: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
  change: {
    color: 'red',
  },
};

export default Card;
