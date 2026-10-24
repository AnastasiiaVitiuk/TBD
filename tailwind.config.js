/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        nhs: {
          blue: '#005EB8',
          darkblue: '#003087',
          brightblue: '#0072CE',
          lightblue: '#41B6E6',
          aqua: '#00A9CE',
          green: '#007F3B',
          warmyellow: '#FFB81C',
          emergency: '#DA291C',
          grey: {
            50: '#F0F4F5',
            100: '#E8EDEE',
            200: '#D8DDE0',
            500: '#768692',
            800: '#425563',
            900: '#212B32',
          },
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
};
