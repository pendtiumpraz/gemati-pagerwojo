import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/modules/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2e7d32", // green 800
          dark: "#1b5e20",
          light: "#eaf3ea",
        },
        egg: "#FBC02D", // accent kuning telur
        sidebar: {
          text: "#244233",
          border: "#dce5dc",
        },
        heading: "#15281f",
        danger: "#dc2626",
        warning: "#f59e0b",
        // dark theme surfaces
        darkbg: "#0b140f",
        darkcard: "#0f1a14",
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
