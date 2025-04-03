/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("daisyui"),
    require('@tailwindcss/line-clamp'),
  ],
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#6366f1",
          "secondary": "#8b5cf6",
          "accent": "#5eead4",
          "neutral": "#1e293b",
          "base-100": "#0f172a",
          "info": "#22d3ee",
          "success": "#10b981",
          "warning": "#f59e0b",
          "error": "#ef4444",
        },
      },
    ],
  },
}