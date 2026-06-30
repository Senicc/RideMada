/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0f1117',
        surface: '#1a1d27',
        border: '#2a2f3d',
        text: '#f5f7fb',
        muted: '#9aa3b5',
        accent: '#6c5ce7',
        green: '#00b894',
        red: '#ff7675',
        gold: '#fdcb6e',
      }
    },
  },
  plugins: [],
}
