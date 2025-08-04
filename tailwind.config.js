/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          100: "#FFE4E9", // nền nhẹ, hồng sáng hơn
          500: "#E05C78", // hồng nổi bật, phù hợp CTA
          600: "#C04060", // hồng đậm, hover/active
        },
        gray: {
          100: "#F9F9F9",
          200: "#E6E6E6",
          300: "#CCCCCC",
          400: "#999999",
          700: "#333333", // tối hơn để dễ đọc
        },
        maroon: {
          500: "#72121E", // đậm hơn, sang trọng hơn
        },
        background: {
          DEFAULT: "#FFFFFF", // nền trắng
          soft: "#F7F7F7", // nhẹ
        },
      },
      borderRadius: {
        xl: "16px",
        "2xl": "24px",
        full: "9999px",
      },
      fontFamily: {
        sans: ["Inter", "System"],
        playfair: ["PlayfairDisplay", "serif"],
      },
      boxShadow: {
        card: "0 6px 10px rgba(0,0,0,0.08)", // rõ nét hơn
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
