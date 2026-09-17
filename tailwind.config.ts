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
        adhd: {
          green: {
            light: "#d1fae5",
            DEFAULT: "#10b981",
            dark: "#047857",
            glow: "rgba(16, 185, 129, 0.4)",
          },
          yellow: {
            light: "#fef3c7",
            DEFAULT: "#f59e0b",
            dark: "#b45309",
            glow: "rgba(245, 158, 11, 0.4)",
          },
          red: {
            light: "#ffe4e6",
            DEFAULT: "#f43f5e",
            dark: "#be123c",
            glow: "rgba(244, 63, 94, 0.45)",
          },
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "sand-fall": "sandFall 2s ease-in-out infinite",
        "urgent-bounce": "urgentBounce 1s infinite",
      },
      keyframes: {
        sandFall: {
          "0%": { transform: "translateY(0) scaleY(1)", opacity: "0.8" },
          "50%": { transform: "translateY(8px) scaleY(1.4)", opacity: "1" },
          "100%": { transform: "translateY(16px) scaleY(0.6)", opacity: "0" },
        },
        urgentBounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
