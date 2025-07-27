/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2196F3',
        secondary: '#FFA000',
        surface: '#F5F5F5',
        error: '#D32F2F',
      },
    },
  },
  plugins: [],
}