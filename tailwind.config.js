/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // OLX-inspired theme colors
        primary: {
          DEFAULT: '#002F34', // OLX Dark Teal
          light: '#003D42',
          dark: '#002329',
        },
        accent: {
          DEFAULT: '#FFCE32', // OLX Yellow
          light: '#FFD966',
          dark: '#E6B800',
        },
        success: '#23E5DB', // OLX Cyan
        warning: '#FFC107',
        danger: '#D32F2F',
        bg: {
          DEFAULT: '#F7F8F9',
          light: '#FFFFFF',
          dark: '#E8EBED',
        },
        surface: '#FFFFFF',
        'text-primary': '#002F34',
        'text-secondary': '#406367',
        'text-muted': '#7F9799',
        'border-light': '#C8D3D5',
        'border-default': '#B4C0C2',
      },
      borderRadius: {
        '4': '4px',
        '6': '6px',
        '8': '8px',
        '12': '12px',
        '14': '14px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 47, 52, 0.08)',
        'md': '0 2px 8px rgba(0, 47, 52, 0.1)',
        'lg': '0 4px 16px rgba(0, 47, 52, 0.12)',
        'xl': '0 8px 24px rgba(0, 47, 52, 0.15)',
        'card': '0 1px 3px rgba(0, 47, 52, 0.1)',
        'card-hover': '0 4px 12px rgba(0, 47, 52, 0.15)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
