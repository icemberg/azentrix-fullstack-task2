export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'void': 'rgb(var(--color-void) / <alpha-value>)',
        'base': 'rgb(var(--color-base) / <alpha-value>)',
        'surface': 'rgb(var(--color-surface) / <alpha-value>)',
        'elevated': 'rgb(var(--color-elevated) / <alpha-value>)',
        'hover': 'rgb(var(--color-hover) / <alpha-value>)',
        'active': 'rgb(var(--color-active) / <alpha-value>)',
        'dim': 'rgb(var(--color-dim) / <alpha-value>)',
        'subtle': 'rgb(var(--color-subtle) / <alpha-value>)',
        'moderate': 'rgb(var(--color-moderate) / <alpha-value>)',
        'focus': 'rgb(var(--color-focus) / <alpha-value>)',
        'primary': 'rgb(var(--color-primary) / <alpha-value>)',
        'secondary': 'rgb(var(--color-secondary) / <alpha-value>)',
        'muted': 'rgb(var(--color-muted) / <alpha-value>)',
        'ghost': 'rgb(var(--color-ghost) / <alpha-value>)',
        'accent-blue': 'rgb(var(--color-accent-blue) / <alpha-value>)',
        'accent-violet': 'rgb(var(--color-accent-violet) / <alpha-value>)',
        'accent-emerald': 'rgb(var(--color-accent-emerald) / <alpha-value>)',
        'accent-amber': 'rgb(var(--color-accent-amber) / <alpha-value>)',
        'accent-red': 'rgb(var(--color-accent-red) / <alpha-value>)',
        'accent-steel': 'rgb(var(--color-accent-steel) / <alpha-value>)',
        'glow-blue': 'rgba(var(--color-accent-blue) / 0.12)',
        'glow-violet': 'rgba(var(--color-accent-violet) / 0.15)',
        'glow-emerald': 'rgba(var(--color-accent-emerald) / 0.12)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Bricolage Grotesque', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      transitionTimingFunction: {
        'structural': 'cubic-bezier(0.16, 1, 0.3, 1)',
      }
    }
  },
  plugins: [],
}
