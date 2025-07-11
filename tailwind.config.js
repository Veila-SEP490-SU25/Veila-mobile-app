/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        maroon: {
          500: "#800000",
          600: "#660000",
        },
        crimson: {
          900: "#58151c",
        },
      },
    },
  },

  plugins: [],
};
