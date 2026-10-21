/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        vtm: {
          dark: '#1a1a1a',
          panel: '#2a2a2a',
          blood: '#8b0000',
          text: '#e0e0e0',
          border: '#444'
        }
      }
    }
  },
  plugins: []
}
