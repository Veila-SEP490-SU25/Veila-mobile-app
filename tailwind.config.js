/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          100: "#FFF0F3", // Hồng phấn nền nhẹ (background section)
          500: "#F4A6B1", // Hồng ánh nude (CTA, nút bấm chính)
          600: "#D77485", // Hồng đậm hơn (hover, active)
        },
        gray: {
          100: "#F5F5F5",
          200: "#E0E0E0",
          300: "#CFCFCF",
          400: "#9E9E9E",
          700: "#4B4B4B",
        },
        maroon: {
          500: "#8C1C26", // Điểm nhấn đỏ mận (highlight brand)
        },
        background: {
          DEFAULT: "#FFFFFF", // Nền chính
          soft: "#FAFAFA", // Nền nhẹ cho section phụ
        },
      },
      borderRadius: {
        xl: "16px",
        "2xl": "24px",
        full: "9999px",
      },
      fontFamily: {
        sans: ["Inter", "System"], // font mặc định
        playfair: ["PlayfairDisplay", "serif"], // font đẹp
      },
      boxShadow: {
        card: "0 4px 6px rgba(0,0,0,0.05)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
