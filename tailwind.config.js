/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#1e40af",
        "accent-red": "#dc2626",
        "background-light": "#ffffff",
        "background-dark": "#0f172a",
      },
      fontFamily: {
        "display": ["Public Sans", "sans-serif"],
        "sans": ["Public Sans", "sans-serif"],
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px",
      },
    },
  },
  plugins: [],
}
