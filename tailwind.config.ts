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
        "tertiary-fixed": "#86d7ff",
        "error-container": "#ffdad6",
        "surface-container-low": "#fcfaff",
        "on-secondary-fixed-variant": "#7b42ff",
        "surface-tint": "#a277ff",
        "secondary-container": "#8eb0ff",
        "outline": "#b3b3b3",
        "primary-container": "#271744",
        "surface-dim": "#f5edff",
        "surface-variant": "#ecdfff",
        "surface-container-highest": "#ecdfff",
        "surface-container": "#f5edff",
        "on-secondary": "#ffffff",
        "on-primary": "#ffffff",
        "on-tertiary-fixed": "#002113",
        "on-surface": "#271744",
        "on-primary-fixed": "#271744",
        "on-error-container": "#93000a",
        "on-error": "#ffffff",
        "tertiary": "#000000",
        "surface-container-high": "#f0e5ff",
        "surface-container-lowest": "#ffffff",
        "surface": "#ffffff",
        "error": "#ba1a1a",
        "tertiary-fixed-dim": "#5ac8f5",
        "inverse-surface": "#3d2b5c",
        "on-primary-container": "#a391c4",
        "tertiary-container": "#002113",
        "primary": "#000000",
        "primary-fixed-dim": "#d9c4ff",
        "surface-bright": "#ffffff",
        "primary-fixed": "#ecdfff",
        "inverse-primary": "#d9c4ff",
        "secondary": "#a277ff",
        "outline-variant": "#d4c8e3",
        "secondary-fixed": "#e6d9ff",
        "inverse-on-surface": "#fcfaff",
        "background": "#ffffff",
        "on-secondary-fixed": "#1a0066",
        "on-primary-fixed-variant": "#4a3375",
        "on-tertiary-container": "#009668",
        "secondary-fixed-dim": "#ccaaff",
        "on-secondary-container": "#fffbff",
        "on-surface-variant": "#5c4f70",
        "on-background": "#271744",
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
