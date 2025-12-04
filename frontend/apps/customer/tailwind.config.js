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
          50: '#E8F8F8',
          100: '#D1F1F1',
          200: '#A3E3E4',
          300: '#75D5D6',
          400: '#47C7C9',
          500: '#40C4C6', // Main turquoise
          600: '#33A3A5',
          700: '#267B7C',
          800: '#1A5354',
          900: '#0D2A2B',
        },
        secondary: {
          50: '#E8EDF3',
          100: '#D1DBE7',
          200: '#A3B7CF',
          300: '#7593B7',
          400: '#476F9F',
          500: '#1E3A5F', // Main navy
          600: '#182E4C',
          700: '#122339',
          800: '#0C1726',
          900: '#060C13',
        },
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

