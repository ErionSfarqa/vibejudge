import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#f6f3ee",
        foreground: "#161616",
        surface: "#ffffff",
        panel: "#efe9df",
        line: "#e5ddd0",
        brand: {
          DEFAULT: "#1f3c88",
          deep: "#18306c",
          glow: "#7c8bb8",
          rose: "#d8c8cc",
          sky: "#e8eefb"
        }
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"]
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(17,24,39,0.04), 0 18px 50px rgba(15,23,42,0.06)",
        spotlight: "0 14px 32px rgba(31,60,136,0.12)"
      },
      borderRadius: {
        "4xl": "2rem"
      },
      animation: {
        shimmer: "shimmer 2.6s linear infinite"
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        }
      }
    }
  },
  plugins: []
};

export default config;
