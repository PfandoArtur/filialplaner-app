/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'teams-purple': '#6264A7',
        'teams-blue': '#0078D4'
      }
    },
  },
  plugins: [],
}