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
        'success': 'rgb(var(--color-success) / <alpha-value>)',
        'warning': 'rgb(var(--color-warning) / <alpha-value>)',
        'danger': 'rgb(var(--color-danger) / <alpha-value>)',
        'info': 'rgb(var(--color-info) / <alpha-value>)',
        'page': 'var(--color-page)',
        'card': 'var(--color-card)',
        'surface': {
          DEFAULT: 'var(--color-surface)',
          light: 'var(--color-surface-light)',
          dark: 'var(--color-surface-dark)',
          darker: 'var(--color-surface-dark)',
        },
        'main': 'var(--color-text-main)',
        'muted': 'var(--color-text-muted)',
        'border': 'var(--color-border-dark)',
        'border-light': 'var(--color-border)',
        'input-bg': 'var(--color-input-bg)',
        'backdrop': 'var(--color-backdrop)',
      }
    },
  },
  plugins: [],
}
