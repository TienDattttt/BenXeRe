const { colors, typography } = require('./src/constants/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    'src/**/*.{js,jsx,ts,tsx}',
    'public/index.html'
  ],
  theme: {
    extend: {
      colors,
      fontFamily: typography.fonts,
      fontSize: Object.fromEntries(
        Object.entries(typography.sizes).map(([key, [size, lineHeight]]) => [
          key,
          [size, lineHeight]
        ])
      ),
      fontWeight: typography.weights,
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fade-out': 'fadeOut 0.3s ease-in-out',
        'slide-in': 'slideIn 0.5s ease-out forwards',
        'slide-in-right': 'slideInRight 0.3s ease-in-out',
        'slide-out-right': 'slideOutRight 0.3s ease-in-out',
        'bounce-bus': 'bounceBus 0.5s ease-in-out infinite',
        'move-road': 'moveRoad 2s linear infinite',
        'move-cloud': 'moveCloud 15s linear infinite',
        'fade-smoke': 'fadeSmoke 1s linear infinite',
        'pulse-price': 'pulsatePrice 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideIn: {
          '0%': { 
            transform: 'translateY(1rem)',
            opacity: '0'
          },
          '100%': { 
            transform: 'translateY(0)',
            opacity: '1'
          },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOutRight: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        bounceBus: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        moveRoad: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '-100px 0' },
        },
        moveCloud: {
          '0%': { transform: 'translateX(-100px)' },
          '100%': { transform: 'translateX(calc(100vw + 100px))' },
        },
        fadeSmoke: {
          '0%': { 
            opacity: '0',
            transform: 'translate(0, 0)',
          },
          '50%': { opacity: '0.8' },
          '100%': { 
            opacity: '0',
            transform: 'translate(-20px, -20px)',
          },
        },
        pulsatePrice: {
          '0%, 100%': {
            transform: 'scale(1)',
            opacity: '1',
          },
          '50%': {
            transform: 'scale(1.05)',
            opacity: '0.8',
          },
        },
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [],
};
