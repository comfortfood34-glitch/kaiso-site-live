/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        kaiso: {
          bg: "#050608",
          card: "#0D0D0D",
          border: "#1A1A1A",
          gold: "#C9A24A",
          "gold-light": "#D4AF5F",
          red: "#D11B2A",
          text: "#E5E5E5",
          muted: "#888888",
        },
        primary: {
          DEFAULT: "#C9A24A",
          foreground: "#000000",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Montserrat", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "0px",
        md: "0px",
        sm: "0px",
        DEFAULT: "0px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
