const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: '#0b0f14',
        neon: '#60e0ff',
        lilac: '#c792ff',
        primary: {
          50: '#eef4ff',
          100: '#dbe6ff',
          200: '#b7ceff',
          300: '#8aaeff',
          400: '#5d8aff',
          500: '#2f63ff',
          600: '#1947d8',
          700: '#1336a6',
          800: '#0d2574',
          900: '#071542'
        }
      },
      fontFamily: {
        sans: ['"Inter Variable"', ...defaultTheme.fontFamily.sans]
      },
      backdropBlur: {
        glass: '18px'
      },
      boxShadow: {
        glow: '0 0 30px rgba(96, 224, 255, 0.25)'
      }
    }
  },
  plugins: []
};
