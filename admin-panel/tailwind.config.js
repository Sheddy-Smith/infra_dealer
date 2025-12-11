/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#007BFF',
          dark: '#0056b3',
        },
        accent: {
          DEFAULT: '#D32F2F',
          dark: '#9a0007',
        },
        success: '#2E7D32',
        warning: '#FFC107',
        bg: '#F8F9FA',
        surface: '#FFFFFF',
        'text-primary': '#212121',
        'text-secondary': '#757575',
      },
      borderRadius: {
        '14': '14px',
      },
      boxShadow: {
        'sm': '0 1px 3px rgba(0, 0, 0, 0.12)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 20px rgba(0, 0, 0, 0.15)',
        'xl': '0 20px 30px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
}
