import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#FBF7F0",
        cream: "#F4ECDD",
        paper: "#FFFDF9",
        gold: {
          DEFAULT: "#B8935A",
          light: "#C9A96A",
          deep: "#8A6D3B",
          soft: "#E6D3AC",
        },
        rose: {
          DEFAULT: "#A8324A",
          soft: "#C97A88",
        },
        ink: "#3A322A",
        muted: "#8B8177",
        sage: "#7C8B6F",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "serif"],
        script: ["var(--font-dancing)", "cursive"],
        cormorant: ["var(--font-cormorant)", "serif"],
        sans: ["var(--font-be-vietnam)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 50px -20px rgba(58,50,42,.35)",
        "soft-sm": "0 8px 24px -12px rgba(58,50,42,.30)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(.22,1,.36,1)",
      },
    },
  },
  plugins: [],
};

export default config;
