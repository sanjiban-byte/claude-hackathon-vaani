/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: '#FF6B00',
        'india-green': '#138808',
        navy: '#0A1628',
        slate: '#1E2D45',
        muted: '#8A9BB0',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['DM Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}