import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext({ theme: "light", toggleTheme: () => { }, setTheme: () => { } })

export const ThemeProvider = ({ children }) => {
  const getPreferred = () => {
    if (typeof window === 'undefined') return 'light'
    const stored = localStorage.getItem('theme')
    if (stored === 'light' || stored === 'dark') return stored
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  }

  const [theme, setTheme] = useState(getPreferred)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('theme', theme)
    } catch { }
  }, [theme])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => {
      const stored = localStorage.getItem('theme')
      if (!stored) setTheme(e.matches ? 'dark' : 'light')
    }
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  const toggleTheme = () => setTheme((prev) => prev === 'light' ? 'dark' : 'light')

  const value = useMemo(() => ({ theme, toggleTheme, setTheme }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
