export const MAX_SEATS = 32;

export const sortOptions = [
  {
    label: "Rating - Ascending",
    value: "rating-asc",
  },
  {
    label: "Rating - Ascending",
    value: "rating-dsc",
  },
  {
    label: "Price - Ascending",
    value: "price-asc",
  },
  {
    label: "Price - Decending",
    value: "price-dsc",
  },
];

// API URLs
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

export const getBusImageUrl = (imageUrl) => {
  if (!imageUrl) return '/images/default-bus.jpg';
  
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  if (imageUrl.startsWith('/')) {
    return `${API_BASE_URL}${imageUrl}`;
  }
  
  return `${API_BASE_URL}/api/bus-images/${imageUrl}`;
};
