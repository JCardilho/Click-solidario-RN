/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.{js,ts,tsx}', './app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}', './layouts/**/*.{js,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        kanit: ['"Kanit_400Regular"'],
        montserrat: ['"Montserrat_400Regular"'],
      },
      colors: {
        primary: '#023E8A',
      },
    },
  },
  plugins: [],
};
