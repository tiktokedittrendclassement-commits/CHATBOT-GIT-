'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthCallback() {
    const router = useRouter()
    const [status, setStatus] = useState('Finalisation de la connexion...')
    const [showSkip, setShowSkip] = useState(false)

    useEffect(() => {
        let isMounted = true

        // 1. Setup Auth Listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth Callback Event:', event, !!session)
            if (session && isMounted) {
                window.location.href = '/dashboard'
            }
        })

        // 2. Immediate & Periodic Check
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session && isMounted) {
                window.location.href = '/dashboard'
                return true
            }
            return false
        }

        const interval = setInterval(async () => {
            const found = await checkSession()
            if (found) clearInterval(interval)
        }, 1000)

        // 3. Fallback / Timeout
        const timeout = setTimeout(() => {
            if (isMounted) {
                setShowSkip(true)
                setStatus('La connexion prend un peu plus de temps que prévu...')
            }
        }, 5000)

        return () => {
            isMounted = false
            subscription.unsubscribe()
            clearInterval(interval)
            clearTimeout(timeout)
        }
    }, [])

    const handleManualRedirect = () => {
        window.location.href = '/dashboard'
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#030308',
            color: '#fff',
            fontFamily: 'Inter, sans-serif'
        }}>
            <div style={{ textAlign: 'center', padding: '0 20px' }}>
                <div style={{
                    width: 40,
                    height: 40,
                    border: '3px solid rgba(255,255,255,0.1)',
                    borderTopColor: '#673DE6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 20px'
                }}></div>
                <p style={{ opacity: 0.9, fontSize: 16, fontWeight: 500, marginBottom: 10 }}>{status}</p>
                <p style={{ opacity: 0.5, fontSize: 13, maxWidth: 300, margin: '0 auto' }}>
                    Nous configurons votre session sécurisée.
                </p>

                {showSkip && (
                    <button
                        onClick={handleManualRedirect}
                        style={{
                            marginTop: 30,
                            padding: '12px 24px',
                            background: '#673DE6',
                            color: '#white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 10px 20px rgba(103, 61, 230, 0.2)'
                        }}
                    >
                        Accéder au tableau de bord
                    </button>
                )}
            </div>
            <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    )
}
