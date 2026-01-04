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
        // Base Palette (Zinc/Graphite)
        background: "#0B0B0F", // Deepest dark
        surface: "#18181B",    // Card background
        border: "#27272A",     // Subtle borders
        
        // Text
        primary: "#E5E7EB",    // Main text
        secondary: "#9CA3AF",  // Subtitles/labels
        
        // Brand/Accent (Emerald)
        brand: {
          DEFAULT: "#10B981",  // Emerald-500
          hover: "#34D399",    // Emerald-400
          dark: "#059669",     // Emerald-600
        },
        
        // Semantic States
        error: "#F87171",
        warning: "#F59E0B",
        info: "#2DD4BF",
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'], // We'll set this up in layout
      },
    },
  },
  plugins: [],
};
export default config;