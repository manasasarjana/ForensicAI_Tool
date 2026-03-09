/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        action: '#10B981', // Clean Emerald Trace
        alert: '#EF4444',  // Red 500 (Alert)
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',  // Indigo (Professional Accent)
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        dark: {
          50: '#fafafa',
          100: '#f4f4f5', // Crisp White
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa', // Muted text
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46', // Hover lines
          800: '#27272a', // Zinc 800 (Card Surface)
          900: '#18181b', // Zinc 900 
          950: '#09090b', // Zinc 950 (Absolute Background)
        }
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
      }
    },
  },
  plugins: [],
}