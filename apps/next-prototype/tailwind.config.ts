import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#070B16",
          900: "#0A1020",
          850: "#0D1324",
          800: "#101827",
          700: "#162036",
        },
        border: {
          DEFAULT: "#1F2A44",
          soft: "rgba(148, 163, 184, 0.18)",
        },
        brand: {
          purple: "#7C3AED",
          light: "#A855F7",
          soft: "rgba(124, 58, 237, 0.16)",
        },
        success: "#22C55E",
        warning: "#FACC15",
        danger: "#EF4444",
      },
      boxShadow: {
        glow: "0 0 10px rgba(124, 58, 237, 0.1)",
        panel: "0 8px 22px rgba(0, 0, 0, 0.12)",
      },
      backgroundImage: {
        "app-radial":
          "radial-gradient(circle at 18% 0%, rgba(124, 58, 237, 0.06), transparent 30%), radial-gradient(circle at 88% 12%, rgba(34, 197, 94, 0.035), transparent 26%)",
        "panel-glow":
          "linear-gradient(135deg, rgba(124, 58, 237, 0.035), rgba(13, 19, 36, 0.28) 35%, rgba(16, 24, 39, 0.68))",
      },
    },
  },
  plugins: [],
};

export default config;
