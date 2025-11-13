const config = {
  development: {
    wsUrl: 'http://localhost:8080/ws'
  },
  production: {
    wsUrl: process.env.REACT_APP_WS_URL || 'https://api.benxeso.com/ws'
  }
};

export default config[process.env.NODE_ENV || 'development']; 