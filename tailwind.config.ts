import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#2D8C6A",
          dark: "#1A6B4F",
          light: "#6EE7B7",
        },
        tier: {
          basic: "#2D8C6A",
          rhythm: "#B45309",
          ep: "#2563EB",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Noto Serif SC", "serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
