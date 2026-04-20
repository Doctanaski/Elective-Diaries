'use client'

import { useTheme } from './ThemeProvider'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="text-on-surface-variant hover:text-primary p-2 rounded-lg
                 hover:bg-surface-variant/50 transition-all border border-outline-variant/50
                 flex items-center justify-center"
    >
      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
        {theme === 'dark' ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  )
}
