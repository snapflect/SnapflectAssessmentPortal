/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'brand': {
          DEFAULT: '#3b82f6', // Electric Blue
          dark: '#2563eb',
          light: '#60a5fa',
        },
        'accent': {
          DEFAULT: '#8b5cf6', // Neon Purple
          dark: '#7c3aed',
          light: '#a78bfa',
        },
        'page': 'var(--color-page)',
        'card': 'var(--color-card)',
        'main': 'var(--color-text-main)',
        'muted': 'var(--color-text-muted)',
        'border-light': 'var(--color-border)',
        'input-bg': 'var(--color-input-bg)',
        'backdrop': 'var(--color-backdrop)',
      }
    },
  },
  plugins: [],
}
