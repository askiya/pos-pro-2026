import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "tertiary-fixed": "#6ffbbe",
        "error-container": "#ffdad6",
        "surface-container-low": "#f2f3ff",
        "on-secondary-fixed-variant": "#2f2ebe",
        "surface-tint": "#565e74",
        "secondary-container": "#6063ee",
        "outline": "#76777d",
        "primary-container": "#131b2e",
        "surface-dim": "#d2d9f4",
        "surface-variant": "#dae2fd",
        "surface-container-highest": "#dae2fd",
        "surface-container": "#eaedff",
        "on-secondary": "#ffffff",
        "on-primary": "#ffffff",
        "on-tertiary-fixed": "#002113",
        "on-surface": "#131b2e",
        "on-primary-fixed": "#131b2e",
        "on-error-container": "#93000a",
        "on-error": "#ffffff",
        "tertiary": "#000000",
        "surface-container-high": "#e2e7ff",
        "surface-container-lowest": "#ffffff",
        "surface": "#faf8ff",
        "error": "#ba1a1a",
        "tertiary-fixed-dim": "#4edea3",
        "inverse-surface": "#283044",
        "on-primary-container": "#7c839b",
        "tertiary-container": "#002113",
        "primary": "#000000",
        "primary-fixed-dim": "#bec6e0",
        "surface-bright": "#faf8ff",
        "primary-fixed": "#dae2fd",
        "inverse-primary": "#bec6e0",
        "secondary": "#4648d4",
        "outline-variant": "#c6c6cd",
        "secondary-fixed": "#e1e0ff",
        "inverse-on-surface": "#eef0ff",
        "background": "#faf8ff",
        "on-secondary-fixed": "#07006c",
        "on-primary-fixed-variant": "#3f465c",
        "on-tertiary-container": "#009668",
        "secondary-fixed-dim": "#c0c1ff",
        "on-secondary-container": "#fffbff",
        "on-surface-variant": "#45464d",
        "on-background": "#131b2e",
        "on-tertiary-fixed-variant": "#005236",
        "on-tertiary": "#ffffff"
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      fontFamily: {
        headline: ["var(--font-plus-jakarta)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        label: ["var(--font-inter)", "sans-serif"]
      }
    },
  },
  plugins: [],
};

export default config;
