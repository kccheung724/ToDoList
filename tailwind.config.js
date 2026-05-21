/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        accent: '#ec4899',
        background: '#0f172a',
        surface: '#1e293b',
        text: '#f1f5f9',
        muted: '#64748b',
      },
    },
  },
  plugins: [],
}
