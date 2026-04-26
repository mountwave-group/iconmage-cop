/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base: 'var(--bg-base)',
          surface: 'var(--bg-surface)',
          elevated: 'var(--bg-elevated)',
          inset: 'var(--bg-inset)',
          // Backwards-compat alias used by a few legacy callsites.
          primary: 'var(--bg-base)',
        },
        bronze: {
          DEFAULT: 'var(--bronze)',
          soft: 'var(--bronze-soft)',
          line: 'var(--bronze-line)',
          deep: 'var(--bronze-deep)',
        },
        ink: {
          primary: 'var(--ink-primary)',
          secondary: 'var(--ink-secondary)',
          muted: 'var(--ink-muted)',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        eyebrow: '0.18em',
        wordmark: '0.22em',
        label: '0.08em',
      },
      borderRadius: {
        luxe: '2px',
      },
      transitionTimingFunction: {
        luxe: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
      keyframes: {
        'rise-in': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        sweep: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'rise-in': 'rise-in 320ms cubic-bezier(0.22, 0.61, 0.36, 1) both',
      },
    },
  },
  plugins: [],
}

