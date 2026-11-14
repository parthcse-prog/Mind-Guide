/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#002531",
          dark: "#1a3b47",
          teal: "#acecdc",
          tealHover: "#8ee4d0",
          accent: "#4648d4",
          soft: "#f0f7f4",
          light: "#f9f9ff",
        },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "'Poppins'", "system-ui", "sans-serif"],
        heading: ["'Manrope'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
