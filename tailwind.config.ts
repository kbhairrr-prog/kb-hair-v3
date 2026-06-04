import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // KB Hair — Identité visuelle officielle
        black: {
          DEFAULT: "#0A0A0A",
          soft: "#111111",
          muted: "#1A1A1A",
        },
        gold: {
          DEFAULT: "#C9A84C",
          light: "#D4B96A",
          dark: "#A8873A",
          pale: "#F0E4C0",
          shine: "#E8CC7A",
        },
        cream: {
          DEFAULT: "#FAF7F2",
          dark: "#F0EBE3",
        },
        surface: {
          DEFAULT: "#141414",
          elevated: "#1C1C1C",
          border: "#2A2A2A",
        },
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "serif"],
        body: ["var(--font-jost)", "sans-serif"],
        accent: ["var(--font-playfair)", "serif"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem" }],
        "display-2xl": ["4.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-xl": ["3.75rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-lg": ["3rem", { lineHeight: "1.15", letterSpacing: "-0.015em" }],
        "display-md": ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "display-sm": ["1.875rem", { lineHeight: "1.25" }],
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "26": "6.5rem",
        "30": "7.5rem",
        "34": "8.5rem",
        "38": "9.5rem",
        "42": "10.5rem",
        "46": "11.5rem",
        "50": "12.5rem",
      },
      letterSpacing: {
        "widest-xl": "0.25em",
        "widest-2xl": "0.35em",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #C9A84C 0%, #E8CC7A 50%, #A8873A 100%)",
        "gold-shimmer": "linear-gradient(90deg, #A8873A 0%, #E8CC7A 25%, #C9A84C 50%, #E8CC7A 75%, #A8873A 100%)",
        "dark-gradient": "linear-gradient(180deg, #0A0A0A 0%, #141414 100%)",
        "hero-overlay": "linear-gradient(180deg, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.6) 60%, rgba(10,10,10,0.95) 100%)",
      },
      animation: {
        "shimmer": "shimmer 3s ease-in-out infinite",
        "fade-up": "fadeUp 0.8s ease forwards",
        "fade-in": "fadeIn 0.6s ease forwards",
        "slide-in-right": "slideInRight 0.5s ease forwards",
        "scale-in": "scaleIn 0.4s ease forwards",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      transitionTimingFunction: {
        "luxury": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "premium": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      boxShadow: {
        "gold": "0 0 40px rgba(201, 168, 76, 0.15)",
        "gold-lg": "0 0 80px rgba(201, 168, 76, 0.2)",
        "card": "0 4px 24px rgba(0,0,0,0.4)",
        "card-hover": "0 12px 48px rgba(0,0,0,0.6)",
        "luxury": "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(201,168,76,0.08)",
      },
      borderColor: {
        gold: "#C9A84C",
        "gold-dim": "rgba(201, 168, 76, 0.2)",
        "gold-subtle": "rgba(201, 168, 76, 0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
