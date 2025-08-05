/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans' : ['Instrument Serif', 'serif'],
      },
      colors: {
          'background':'#FEF7F3',
          'darkgreen':'#145449',
          'darkred': '#905859',
          'accent': '#E9DCD3',
          'greenaccent': '#E7F5DF',
          'lightgreen': "#5A8D6D",
          'lightbackground': '#FFFBF8',
      }
    },
  },
  plugins: [],
}