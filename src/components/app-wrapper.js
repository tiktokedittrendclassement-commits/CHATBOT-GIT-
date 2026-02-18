
'use client'

import { usePathname } from 'next/navigation'
import VendoAssistant from './vendo-assistant'

export default function AppWrapper({ children }) {
    const pathname = usePathname()

    // Hide assistant on maintenance page and embed pages
    const hideAssistant = pathname?.startsWith('/maintenance') || pathname?.startsWith('/embed')

    return (
        <>
            {children}
            {!hideAssistant && <VendoAssistant />}
        </>
    )
}
