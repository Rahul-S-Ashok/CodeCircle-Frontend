/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      colors: {
        canvas: "#F7F9FC",
        panel: "#FFFFFF",

        ink: "#172033",
        muted: "#64748B",

        teal: "#14B8A6",
        volt: "#38BDF8",
        bloom: "#8B5CF6",

        border: "#E2E8F0",
        surface: "#F1F5F9",
      },

      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },

      boxShadow: {
        glow: "0 12px 40px rgba(20, 184, 166, 0.15)",
        card: "0 8px 30px rgba(15, 23, 42, 0.08)",
        soft: "0 4px 20px rgba(15, 23, 42, 0.06)",
      },
    },
  },

  plugins: [],
};