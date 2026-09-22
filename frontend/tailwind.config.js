/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jh: {
          green: "#0B6623",
          navy: "#0F172A",
          accent: "#0284C7",
          gold: "#D97706",
          bg: "#F8FAFC"
        }
      }
    },
  },
  plugins: [],
}
