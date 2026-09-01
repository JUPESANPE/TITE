import type { Config } from "tailwindcss";

// Design system de TITE: fashion, premium, minimalista, cálido.
// Ver ARCHITECTURE.md — nada de gradientes exagerados ni saturación.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#141110",
          soft: "#3A3532",
        },
        paper: {
          DEFAULT: "#FAF7F3",
          raised: "#FFFFFF",
        },
        clay: {
          50: "#FBF0EA",
          100: "#F5DDD0",
          300: "#E3AA8E",
          500: "#C97A55",
          600: "#B1603C",
          700: "#8F4C30",
        },
        line: "#E7E0D8",
        success: "#3E7A5C",
        warning: "#C98A2B",
        danger: "#B5473A",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.75rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(20, 17, 16, 0.04), 0 8px 24px rgba(20, 17, 16, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
