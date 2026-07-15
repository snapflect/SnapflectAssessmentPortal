/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'brand': {
          DEFAULT: 'rgb(var(--color-brand) / <alpha-value>)',
          dark: 'rgb(var(--color-brand-dark) / <alpha-value>)',
          light: 'rgb(var(--color-brand-light) / <alpha-value>)',
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
