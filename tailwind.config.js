/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium palette: deep indigo + electric purple, emerald & gold accents.
        // Legacy token names are remapped so existing classes resolve to the new system.
        perx: {
          indigo: "#4F46E5",
          purple: "#7C3AED",
          violet: "#8B5CF6",
          emerald: "#10B981",
          gold: "#E0A82E",
          ink: "#16131F",
          muted: "#6B6880",
          line: "#ECEAF3",
          bg: "#FBFBFD",
          surface: "#FFFFFF",
          // legacy aliases -> premium tones
          orange: "#4F46E5",
          coral: "#8B5CF6",
          pink: "#7C3AED",
          rose: "#8B5CF6",
          blue: "#4F46E5",
          sky: "#10B981",
          yellow: "#E0A82E",
          cloud: "#FBFBFD",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "1.25rem",
        "5xl": "1.75rem",
      },
      boxShadow: {
        pop: "0 24px 60px -24px rgba(79,70,229,0.30)",
        "pop-sm": "0 8px 24px -12px rgba(22,19,31,0.16)",
        soft: "0 1px 2px rgba(22,19,31,0.04), 0 6px 20px -12px rgba(22,19,31,0.14)",
        glow: "0 0 0 1px rgba(124,58,237,0.10), 0 18px 50px -20px rgba(124,58,237,0.45)",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        reveal: {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "60%": { transform: "scale(1.08)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        reveal: "reveal 0.5s ease-out",
      },
    },
  },
  plugins: [],
};
