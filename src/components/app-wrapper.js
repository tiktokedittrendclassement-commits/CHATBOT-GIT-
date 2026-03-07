
'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import VendoAssistant from './vendo-assistant'

export default function AppWrapper({ children }) {
    const pathname = usePathname()

    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Hide assistant on maintenance page, embed pages, and auth pages (login/register)
    const hideAssistant = !pathname ||
        pathname.startsWith('/maintenance') ||
        pathname.startsWith('/embed') ||
        pathname.startsWith('/reseller') ||
        pathname === '/login' ||
        pathname === '/register'

    if (!mounted) return children

    return (
        <>
            {children}
            {!hideAssistant && <VendoAssistant />}
        </>
    )
}
