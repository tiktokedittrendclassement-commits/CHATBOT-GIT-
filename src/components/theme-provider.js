
'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({
    theme: 'dark',
    toggleTheme: () => { }
})

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('dark')

    useEffect(() => {
        const savedTheme = localStorage.getItem('vendo-theme') || 'dark'
        setTheme(savedTheme)
        document.documentElement.setAttribute('data-theme', savedTheme)
    }, [])

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark'
        setTheme(newTheme)
        localStorage.setItem('vendo-theme', newTheme)
        document.documentElement.setAttribute('data-theme', newTheme)
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => useContext(ThemeContext)
