/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#080c14",
          card: "#0f172a",
          cardlight: "#1e293b",
          border: "#1e293b",
          accent: "#38bdf8",
          success: "#10b981",
          danger: "#ef4444",
          warning: "#f59e0b",
          text: "#f8fafc",
          muted: "#94a3b8"
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 15px rgba(56, 189, 248, 0.3)',
        'glow-green': '0 0 15px rgba(16, 185, 129, 0.3)',
        'glow-red': '0 0 15px rgba(239, 68, 68, 0.3)'
      }
    },
  },
  plugins: [],
}
