
'use client'

import { usePathname } from 'next/navigation'
import VendoAssistant from './vendo-assistant'

export default function AppWrapper({ children }) {
    const pathname = usePathname()

    // Hide assistant on maintenance page, embed pages, and auth pages (login/register)
    const hideAssistant = pathname?.startsWith('/maintenance') ||
        pathname?.startsWith('/embed') ||
        pathname === '/login' ||
        pathname === '/register'

    return (
        <>
            {children}
            {!hideAssistant && <VendoAssistant />}
        </>
    )
}
