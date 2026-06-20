/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(${name}) / <alpha-value>)`;

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
        // All tokens resolve to CSS variables (see globals.css) so themes recolor
        // everything. Default (Aurora) values equal the original premium palette.
        perx: {
          indigo: v("--c-primary"),
          blue: v("--c-primary"),
          purple: v("--c-primary2"),
          violet: v("--c-violet"),
          emerald: v("--c-accent"),
          sky: v("--c-accent"),
          gold: v("--c-gold"),
          yellow: v("--c-gold"),
          ink: v("--c-ink"),
          muted: v("--c-muted"),
          line: v("--c-line"),
          bg: v("--c-bg"),
          cloud: v("--c-bg"),
          surface: v("--c-surface"),
          // legacy aliases
          orange: v("--c-primary"),
          coral: v("--c-violet"),
          pink: v("--c-primary2"),
          rose: v("--c-violet"),
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
