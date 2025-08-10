/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#FFF5F7",
          100: "#FFE4E9",
          500: "#E05C78",
          600: "#C04060",
          700: "#A8324F",
        },
        secondary: {
          50: "#F2F6FF",
          100: "#DCE7FF",
          500: "#5C78E0",
          600: "#3E5AC0",
        },
        gray: {
          100: "#F9F9F9",
          200: "#E6E6E6",
          300: "#CCCCCC",
          400: "#999999",
          600: "#555555",
          700: "#333333",
        },
        maroon: {
          500: "#72121E",
        },
        background: {
          DEFAULT: "#FFFFFF",
          soft: "#F7F7F7",
        },
      },
      gradientColorStops: (theme) => ({
        ...theme("colors"),
        brand: ["#E05C78", "#C04060"],
      }),
      borderRadius: {
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
        full: "9999px",
      },
      fontFamily: {
        sans: ["Inter", "System", "sans-serif"],
        playfair: ["PlayfairDisplay", "serif"],
      },
      boxShadow: {
        card: "0 6px 12px rgba(0,0,0,0.08)",
        lg: "0 10px 20px rgba(0,0,0,0.1)",
        soft: "0 2px 6px rgba(0,0,0,0.05)",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio"),
  ],
};
