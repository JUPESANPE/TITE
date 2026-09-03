import type { Config } from "tailwindcss";

// Design system de TITE: fashion, premium, minimalista, cálido.
// Fuente de verdad de la identidad: BRAND.md. Nada de gradientes ni saturación.
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
        // Superficie de identidad: el módulo principal de la Home y el zócalo
        // de la barra inferior apoyan sobre madera, no sobre papel (BRAND.md).
        wood: {
          100: "#E6D9C7",
          300: "#A9855F",
          500: "#6E5138",
          700: "#4E3828",
          900: "#2E211A",
        },
        // Texto y wordmark sobre madera.
        bone: "#F7F1E8",
        // Ocre de los Hilitos. Única excepción a la regla de un solo acento:
        // sólo el ícono de la moneda, su número sobre madera y el anillo del
        // contador semanal (BRAND.md).
        hilo: "#E0A02E",
        line: "#E7E0D8",
        success: "#3E7A5C",
        warning: "#C98A2B",
        danger: "#B5473A",
      },
      fontFamily: {
        // Cuerpo: Karla. Display/wordmark/números: Outfit. Se abandona Inter
        // deliberadamente — ver BRAND.md, sección Tipografía.
        sans: ["var(--font-body)", "Karla", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Outfit", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.75rem",
        "3xl": "2rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(20, 17, 16, 0.04), 0 8px 24px rgba(20, 17, 16, 0.06)",
        // Única sombra propia del botón central de la barra inferior.
        raised: "0 6px 20px rgba(20, 17, 16, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
