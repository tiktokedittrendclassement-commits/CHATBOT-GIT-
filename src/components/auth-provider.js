
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        if (!supabase) {
            setLoading(false)
            return
        }

        const ensureProfileExists = async (sessionUser) => {
            if (!sessionUser) return

            // Check if profile exists
            const { data, error } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', sessionUser.id)
                .single()

            if (error && error.code === 'PGRST116') {
                // Profile missing, create it
                console.log('Profile missing for user, creating now...', sessionUser.id)
                const { error: insertError } = await supabase
                    .from('profiles')
                    .insert({
                        id: sessionUser.id,
                        email: sessionUser.email,
                        full_name: sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || sessionUser.user_metadata?.given_name || 'Membre'
                    })

                if (insertError) {
                    console.error('Error auto-creating profile:', insertError)
                }
            }
        }

        // Check active session
        const getSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()
                if (error) {
                    console.error('Error fetching session:', error)
                }
                const sessionUser = session?.user ?? null
                setUser(sessionUser)
                setLoading(false)
                if (sessionUser) ensureProfileExists(sessionUser)
            } catch (err) {
                console.error('Auth check failed:', err)
                setLoading(false)
            }
        }

        getSession()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const sessionUser = session?.user ?? null
            setUser(sessionUser)
            setLoading(false)
            if (sessionUser) ensureProfileExists(sessionUser)

            if (_event === 'SIGNED_IN') {
                router.refresh()
            }

            if (_event === 'SIGNED_OUT') {
                router.push('/login')
            }
        })

        return () => subscription.unsubscribe()
    }, [router])

    const signOut = async () => {
        if (supabase) {
            await supabase.auth.signOut()
        }
        sessionStorage.removeItem('vendo_welcome_seen')
        sessionStorage.removeItem('vendo_dashboard_welcome_seen')
        setUser(null)
        router.push('/login')
    }

    return (
        <AuthContext.Provider value={{ user, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
