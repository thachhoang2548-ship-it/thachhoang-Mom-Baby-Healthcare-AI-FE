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
        // Token theme: giá trị khai báo ở :root trong src/index.css (đổi theo data-baby-theme).
        // Dùng: bg-theme-page, text-theme-ink, border-theme-line, bg-theme-brand/10, bg-status-warn-bg
        theme: {
          page: 'rgb(var(--c-page) / <alpha-value>)',
          sidebar: 'rgb(var(--c-sidebar) / <alpha-value>)',
          surface: 'rgb(var(--c-surface) / <alpha-value>)',
          ink: 'rgb(var(--c-ink) / <alpha-value>)',
          muted: 'rgb(var(--c-muted) / <alpha-value>)',
          brand: 'rgb(var(--c-brand) / <alpha-value>)',
          'brand-soft': 'rgb(var(--c-brand-soft) / <alpha-value>)',
          line: 'rgb(var(--c-line) / <alpha-value>)',
        },
        status: {
          ok: 'rgb(var(--c-ok) / <alpha-value>)',
          'warn-bg': 'rgb(var(--c-warn-bg) / <alpha-value>)',
          'warn-line': 'rgb(var(--c-warn-line) / <alpha-value>)',
          'warn-text': 'rgb(var(--c-warn-text) / <alpha-value>)',
          'danger-bg': 'rgb(var(--c-danger-bg) / <alpha-value>)',
          'danger-line': 'rgb(var(--c-danger-line) / <alpha-value>)',
          'danger-text': 'rgb(var(--c-danger-text) / <alpha-value>)',
          'ok-bg': 'rgb(var(--c-ok-bg) / <alpha-value>)',
          'ok-line': 'rgb(var(--c-ok-line) / <alpha-value>)',
          'ok-text': 'rgb(var(--c-ok-text) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ["Manrope", "sans-serif"],
        brand: ['"Baloo 2"', "Manrope", "sans-serif"],
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
