/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        kku: {
          red: '#8B1A1A',
          darkred: '#6B1414',
          gold: '#C9A227',
          light: '#F5F0E8',
        },
      },
    },
  },
  plugins: [],
}
