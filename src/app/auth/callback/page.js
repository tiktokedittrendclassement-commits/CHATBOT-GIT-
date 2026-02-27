'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthCallback() {
    const router = useRouter()

    useEffect(() => {
        // More robust session detection
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' || session) {
                // Force a hard redirect or use router.push
                window.location.href = '/dashboard'
            } else if (event === 'SIGNED_OUT') {
                router.push('/login')
            }
        })

        // Also check immediately
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                window.location.href = '/dashboard'
            }
        }
        checkSession()

        return () => subscription.unsubscribe()
    }, [router])

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
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    width: 40,
                    height: 40,
                    border: '3px solid rgba(255,255,255,0.1)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 20px'
                }}></div>
                <p style={{ opacity: 0.6, fontSize: 14 }}>Finalisation de la connexion...</p>
            </div>
            <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    )
}
