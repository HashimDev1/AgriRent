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
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          650: '#169143',
          700: '#15803d',
          750: '#157238',
          800: '#166534',
          850: '#135c2f',
          900: '#14532d',
          950: '#0f3d21',
        },
        earth: {
          50: '#faf7f2',
          100: '#f4ece1',
          200: '#e7d8c4',
          300: '#d5bea1',
          400: '#bf9e7a',
          500: '#ab8259',
          600: '#9d714c',
          700: '#835a3e',
          800: '#6b4934',
          900: '#583c2c',
        },
        gray: {
          150: '#eef0f3',
          650: '#404954',
          850: '#182230',
        }
      }
    },
  },
  plugins: [],
}
