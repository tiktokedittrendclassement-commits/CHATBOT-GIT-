
'use client'

import { usePathname } from 'next/navigation'
import VendoAssistant from './vendo-assistant'

export default function AppWrapper({ children }) {
    const pathname = usePathname()

    // Hide assistant on maintenance page, embed pages, and landing page (which has its own demo chatbot)
    const hideAssistant = pathname?.startsWith('/maintenance') || pathname?.startsWith('/embed')

    return (
        <>
            {children}
            {!hideAssistant && <VendoAssistant />}
        </>
    )
}
