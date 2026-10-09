/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        // Brand colours, taken from the logo: a deep navy and a coral accent.
        // Navy carries actions and text; coral is used sparingly for emphasis.
        brand: {
          50: "#f1f4fa",
          100: "#e2e8f3",
          200: "#c6d1e6",
          300: "#9cafd0",
          400: "#6e88b5",
          500: "#4d699b",
          600: "#3a5281",
          700: "#2f4269",
          800: "#233253",
          900: "#18243d",
          950: "#0f1729",
        },
        coral: {
          50: "#fef4f1",
          100: "#fde6df",
          200: "#fac9bb",
          300: "#f5a38c",
          400: "#ee7a5b",
          500: "#e2593a",
          600: "#cc4529",
          700: "#aa3720",
          800: "#8c301f",
          900: "#742d1f",
        },
        canvas: "#f5f6f9",
        // Chart colours, checked with the dataviz palette validator. The brand navy
        // is too grey to carry data, so charts use this blue (and orange as the
        // second series, e.g. Yes/No).
        data: {
          blue: "#2a78d6",
          track: "#dce9fa",
          orange: "#eb6834",
        },
      },
      fontFamily: {
        sans: ['"Geist Variable"', "ui-sans-serif", "system-ui", "sans-serif"],
        display: ['"Bricolage Grotesque Variable"', '"Geist Variable"', "ui-sans-serif", "sans-serif"],
      },
      boxShadow: {
        // Shadows tinted with the brand navy rather than pure black.
        card: "0 1px 2px 0 rgb(24 36 61 / 0.05), 0 1px 3px 0 rgb(24 36 61 / 0.04)",
        raised: "0 4px 12px -2px rgb(24 36 61 / 0.08), 0 2px 4px -2px rgb(24 36 61 / 0.05)",
        overlay: "0 24px 48px -12px rgb(24 36 61 / 0.25), 0 8px 16px -8px rgb(24 36 61 / 0.12)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
      zIndex: {
        sidebar: "40",
        topbar: "30",
        backdrop: "35",
        toast: "1100",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "toast-in": {
          from: { opacity: "0", transform: "translateY(8px) scale(0.98)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 320ms cubic-bezier(0.2, 0.8, 0.2, 1) both",
        "toast-in": "toast-in 240ms cubic-bezier(0.2, 0.8, 0.2, 1) both",
      },
    },
  },
  // Base styles for checkboxes, radios and selects (the select chevron).
  plugins: [require("@tailwindcss/forms")],
};
