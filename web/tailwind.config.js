/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#0F0F0F',
          surface: '#141414',
          elevated: '#1A1A1A',
          inset: '#0B0B0B',
        },
        bronze: {
          DEFAULT: '#C9A48A',
          soft: 'rgba(201,164,138,0.14)',
          line: 'rgba(201,164,138,0.25)',
          deep: '#B07A5A',
        },
        ink: {
          primary: '#FFFFFF',
          secondary: '#B7B7B7',
          muted: 'rgba(255,255,255,0.45)',
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

