import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#08090d",
        foreground: "#f5f7fb",
        border: "rgba(255,255,255,0.12)",
        muted: "#9aa4b2",
        accent: "#74f7c5",
        rose: "#ff6b9a",
        amber: "#f7c86b",
        cyan: "#67d8ff"
      },
      boxShadow: {
        glow: "0 0 80px rgba(116, 247, 197, 0.16)"
      }
    }
  },
  plugins: []
};

export default config;
