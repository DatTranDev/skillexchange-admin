import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fff5f2",
          100: "#ffe8e0",
          200: "#ffcec1",
          300: "#ffb4a2",
          400: "#ffa985",
          500: "#ff8a5b",
          600: "#f27043",
          700: "#d9542f",
          800: "#b84424",
          900: "#973619",
        },
        secondary: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7e22ce",
          800: "#6b21a8",
          900: "#581c87",
        },
      },
      backgroundImage: {
        "gradient-brand":
          "linear-gradient(120deg, #FFA985 0%, #E87BF8 50%, #9333EA 100%)",
        "gradient-brand-hover":
          "linear-gradient(120deg, #ff8a5b 0%, #d946ef 50%, #7e22ce 100%)",
        "gradient-brand-soft":
          "linear-gradient(135deg, #FFD6C7 0%, #F0C4F5 100%)",
      },
      animation: {
        "slide-in-right": "slideInRight 0.3s ease-out",
        "slide-out-right": "slideOutRight 0.3s ease-in",
        "fade-in": "fadeIn 0.2s ease-out",
        "fade-out": "fadeOut 0.2s ease-in",
        "roll-down": "rollDown 0.6s ease-out",
        "gradient-shift": "gradientShift 2s ease-in-out infinite",
      },
      keyframes: {
        slideInRight: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        slideOutRight: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(100%)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        rollDown: {
          "0%": {
            transform: "translateY(-100%) scaleY(0)",
            opacity: "0",
          },
          "50%": {
            transform: "translateY(0%) scaleY(1.1)",
            opacity: "1",
          },
          "100%": {
            transform: "translateY(0%) scaleY(1)",
            opacity: "1",
          },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
