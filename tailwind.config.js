/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cg: {
          green: "#2DBD6E",
          "green-dark": "#22A85F",
          "green-light": "#E8F8EF",
        },
        difficulty: {
          easy: "#2DBD6E",
          medium: "#F59E0B",
          hard: "#EF4444",
        },
        brand: {
          bg: "#F4F6F8",
          card: "#FFFFFF",
          text: "#111827",
          muted: "#4B5563",
          border: "#E5E7EB",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        mono: ["var(--font-fira-code)", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};
