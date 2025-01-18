/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "ze-light": "#F8F8F7",
        "ze-dark": "#1A1A1A",
      },
    },
  },
  plugins: [],
};
