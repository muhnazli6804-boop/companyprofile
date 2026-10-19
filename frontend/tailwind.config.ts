import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          active: "var(--color-primary-active)",
        },
        navy: "var(--color-navy)",
        ink: "var(--color-ink)",
        paper: "var(--color-paper)",
        star: "var(--color-star)",
        tint: {
          100: "var(--color-tint-100)",
          200: "var(--color-tint-200)",
        },
        muted: "var(--color-muted)",
        line: {
          DEFAULT: "var(--color-border)",
          input: "var(--color-border-input)",
        },
        leaf: "var(--color-leaf)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
      },
      borderRadius: {
        control: "var(--radius-control)",
        panel: "var(--radius-panel)",
      },
      boxShadow: {
        float: "var(--shadow-float)",
      },
      fontSize: {
        xs: ["0.8rem", { lineHeight: "1.5" }],
        base: ["1rem", { lineHeight: "1.6" }],
        lg: ["1.25rem", { lineHeight: "1.5" }],
        xl: ["1.563rem", { lineHeight: "1.3" }],
        "2xl": ["1.953rem", { lineHeight: "1.2" }],
        "3xl": ["2.441rem", { lineHeight: "1.15" }],
        display: [
          "clamp(2.441rem, 1.9rem + 2.4vw, 3.052rem)",
          { lineHeight: "1.12", letterSpacing: "-0.01em" },
        ],
      },
      maxWidth: {
        content: "72rem",
        prose: "68ch",
        form: "36rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
