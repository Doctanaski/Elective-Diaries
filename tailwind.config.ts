import type { Config } from 'tailwindcss'

/**
 * Resolve a CSS-variable token (e.g. --surface) as a color that supports
 * Tailwind's opacity modifiers (bg-surface/80, text-primary/70, ...).
 * Tailwind v3 cannot apply alpha to a bare `var()` color, so we emit
 * `color-mix()` for modifiers and the raw variable otherwise.
 */
const svar = (name: string): any => ({ opacityValue }: { opacityValue?: string | number }) => {
  if (opacityValue === undefined) return `var(--${name})`
  const num = typeof opacityValue === 'number' ? opacityValue : parseFloat(opacityValue)
  const pct = Number.isFinite(num) ? Math.round(num * 100) : 100
  return `color-mix(in srgb, var(--${name}) ${pct}%, transparent)`
}

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'surface':                  svar('surface'),
        'surface-container-low':    svar('surface-container-low'),
        'surface-container':        svar('surface-container'),
        'surface-container-high':   svar('surface-container-high'),
        'surface-container-highest':svar('surface-container-highest'),
        'surface-container-lowest': svar('surface-container-lowest'),
        'surface-dim':              svar('surface-dim'),
        'surface-bright':           svar('surface-bright'),
        'surface-variant':          svar('surface-variant'),
        'on-surface':               svar('on-surface'),
        'on-surface-variant':       svar('on-surface-variant'),
        'on-background':            svar('on-background'),
        'background':               svar('background'),
        'primary':                  svar('primary'),
        'primary-container':        svar('primary-container'),
        'on-primary':               svar('on-primary'),
        'on-primary-container':     svar('on-primary-container'),
        'outline':                  svar('outline'),
        'outline-variant':          svar('outline-variant'),
        'error':                    svar('error'),
        'error-container':          svar('error-container'),
        'secondary':                svar('secondary'),
        'secondary-container':      svar('secondary-container'),
        'on-secondary':             svar('on-secondary'),
        'on-secondary-container':   svar('on-secondary-container'),
        'inverse-surface':          svar('inverse-surface'),
        'inverse-on-surface':       svar('inverse-on-surface'),
        'inverse-primary':          svar('inverse-primary'),
        // Keep static aliases that are used directly
        'tertiary':                 '#745470',
        'tertiary-container':       '#ffd7f6',
        'on-tertiary':              '#ffffff',
        'on-tertiary-container':    '#2c122a',
        'on-error':                 '#ffffff',
        'on-error-container':       '#410002',
        'primary-fixed':            '#dce1ff',
        'primary-fixed-dim':        '#b5c4ff',
        'on-primary-fixed':         '#02174b',
        'on-primary-fixed-variant': '#344479',
        'secondary-fixed':          '#dee1f9',
        'secondary-fixed-dim':      '#c1c5dd',
        'on-secondary-fixed':       '#161b2c',
        'on-secondary-fixed-variant':'#414659',
        'tertiary-fixed':           '#ffd7f6',
        'tertiary-fixed-dim':       '#e3badb',
        'on-tertiary-fixed':        '#2c122a',
        'on-tertiary-fixed-variant':'#5b3d57',
        'surface-tint':             '#2e4a9c',
      },
      opacity: {
        '3': '0.03',
        '8': '0.08',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px',
      },
      fontFamily: {
        headline: ['Plus Jakarta Sans', 'sans-serif'],
        body:     ['Plus Jakarta Sans', 'sans-serif'],
        label:    ['Plus Jakarta Sans', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            color: 'var(--on-surface)',
            a: { color: 'var(--primary)' },
            h1: { fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--on-surface)' },
            h2: { fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--on-surface)' },
            h3: { fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--on-surface)' },
          },
        },
      },
    },
  },
  plugins: [],
}
export default config
