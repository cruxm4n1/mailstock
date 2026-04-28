import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#0f0f0f",
        panel: "#1a1a1a",
        panel2: "#202020",
        line: "rgba(245, 245, 245, 0.11)",
        text: "#f5f5f5",
        muted: "#a3a3a3",
        primary: "#00d4aa",
        warning: "#f59e0b",
        danger: "#fb7185"
      },
      boxShadow: {
        panel: "0 2px 8px rgba(0, 0, 0, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
