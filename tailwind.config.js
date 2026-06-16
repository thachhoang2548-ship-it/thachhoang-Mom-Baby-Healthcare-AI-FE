/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FF7A8A",
        saffron: "#FF7A8A",
        "background-light": "#FFF7F8",
        "background-dark": "#1F1416",
        secondary: "#FDBA74",
        accent: "#10B981",
        momPink: { DEFAULT: '#F472B6', light: '#FCE7F3', dark: '#DB2777' },
        momPurple: { DEFAULT: '#A78BFA', light: '#EDE9FE', dark: '#7C3AED' },
        momGreen: { DEFAULT: '#34D399', light: '#D1FAE5', dark: '#059669' },
        momAmber: { DEFAULT: '#FBBF24', light: '#FEF9C3' },
      },
      fontFamily: {
        display: ["Manrope", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "2rem",
        xl: "3rem",
        full: "9999px",
      },
    },
  },
  darkMode: "class",
  plugins: [],
};
