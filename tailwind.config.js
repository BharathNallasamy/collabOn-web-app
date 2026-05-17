/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary brand color (Navy Blue)
        primary: {
          50:  "#e8eef8",
          100: "#c5d3ed",
          200: "#9fb5e0",
          300: "#7897d3",
          400: "#5a80ca",
          500: "#3c69c1",
          600: "#2d5ab0",
          700: "#1f4899",
          800: "#1a3a7e",
          900: "#1D6BA3",  // main brand color
          950: "#155280",
        },
        // Secondary color (Teal)
        secondary: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",  // main secondary color
          800: "#115e59",
          900: "#134e4a",
        },
        // Keep backwards compatibility
        navy: {
          50:  "#e8eef8",
          100: "#c5d3ed",
          200: "#9fb5e0",
          300: "#7897d3",
          400: "#5a80ca",
          500: "#3c69c1",
          600: "#2d5ab0",
          700: "#1f4899",
          800: "#1a3a7e",
          900: "#1D6BA3",
          950: "#155280",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
