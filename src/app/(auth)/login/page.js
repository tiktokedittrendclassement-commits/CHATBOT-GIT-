'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import styles from './page.module.css'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [rememberMe, setRememberMe] = useState(true)
    const router = useRouter()

    // Load saved credentials on mount
    useEffect(() => {
        const savedEmail = localStorage.getItem('vendo_remember_email')
        const savedPassword = localStorage.getItem('vendo_remember_password')
        if (savedEmail) setEmail(savedEmail)
        if (savedPassword) {
            setPassword(savedPassword)
            setRememberMe(true)
        } else {
            setRememberMe(false)
        }
    }, [])

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const trimmedEmail = email.trim()
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

        if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
            setError("Veuillez entrer une adresse email valide (ex: utilisateur@domaine.com)")
            setLoading(false)
            return
        }

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: trimmedEmail,
                password,
            })

            if (error) {
                if (error.message === 'Invalid login credentials') {
                    setError("Email ou mot de passe incorrect.")
                } else if (error.message === 'Email not confirmed') {
                    setError("Veuillez confirmer votre adresse email.")
                } else {
                    setError(error.message)
                }
                return
            }

            // Save or clear credentials based on Remember Me
            if (rememberMe) {
                localStorage.setItem('vendo_remember_email', trimmedEmail)
                localStorage.setItem('vendo_remember_password', password)
            } else {
                localStorage.removeItem('vendo_remember_email')
                localStorage.removeItem('vendo_remember_password')
            }

            router.push('/dashboard')
        } catch (err) {
            setError('Une erreur inattendue est survenue')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            })
            if (error) throw error
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <Link href="/" className={styles.backLink}>
                    <ArrowLeft size={14} />
                    Retour à l&apos;accueil
                </Link>
                <h1 className={styles.title}>Bienvenue</h1>
                <p className={styles.subtitle}>Connectez-vous à votre compte</p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleLogin} className={styles.form}>
                    <div className={styles.field}>
                        <label htmlFor="email">Email</label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="vous@exemple.com"
                            required
                            pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                            title="Veuillez entrer une adresse email valide (ex: utilisateur@domaine.com)"
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#fff',
                                height: 48,
                                borderRadius: 12
                            }}
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="password">Mot de passe</label>
                        <div className={styles.passwordWrapper}>
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className={styles.passwordInput}
                            />
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1"
                                style={{ color: 'white' }}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className={styles.options}>
                        <div className={styles.rememberMe}>
                            <input
                                type="checkbox"
                                id="rememberMe"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <label htmlFor="rememberMe">Se souvenir de moi</label>
                        </div>
                    </div>

                    <Button type="submit" disabled={loading} className={styles.submit}>
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </Button>
                </form>

                <div className={styles.separator}>
                    <span>ou</span>
                </div>

                <button onClick={handleGoogleLogin} className={styles.googleBtn}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M23.64 12.2727C23.64 11.4182 23.5636 10.6091 23.4109 9.81818H12V14.4727H18.5236C18.24 15.9364 17.3891 17.1818 16.1455 18.0182V21.0545H20.0182C22.2764 18.9818 23.64 15.9091 23.64 12.2727Z" fill="#4285F4" />
                        <path d="M12 24.0001C15.24 24.0001 17.9564 22.9274 19.9855 21.0547L16.1127 18.0183C15.0218 18.7528 13.6255 19.182 12 19.182C8.85818 19.182 6.18545 17.0729 5.23636 14.1274H1.23273V17.2274C3.21818 21.1637 7.28727 24.0001 12 24.0001Z" fill="#34A853" />
                        <path d="M6.76364 14.1273C6.51273 13.3818 6.36 12.5818 6.36 11.75C6.36 10.9182 6.51273 10.1182 6.76364 9.37273V6.27273H1.23273C0.447273 7.84545 0 9.61818 0 11.4727C0 13.3273 0.447273 15.1 1.23273 16.6727L6.76364 14.1273Z" fill="#FBBC05" />
                        <path d="M12 4.81818C13.7673 4.81818 15.3491 5.4 16.6 6.56364L20.0618 3.10182C17.9455 1.13636 15.2291 0 12 0C7.28727 0 3.21818 2.83636 1.23273 6.77273L6.76364 9.37273C7.71273 6.42727 10.3855 4.31818 12 4.81818Z" fill="#EA4335" />
                    </svg>
                    Continuer avec Google
                </button>

                <p style={{
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.3)',
                    textAlign: 'center',
                    marginTop: '16px',
                    lineHeight: '1.5'
                }}>
                    En continuant avec Google, vous acceptez nos <Link href="/cgu-cgv" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'underline' }}>CGU</Link> et notre <Link href="/politique-de-confidentialite" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'underline' }}>politique de confidentialité</Link>.
                </p>

                <p className={styles.footer}>
                    Pas encore de compte ? <Link href="/register">S&apos;inscrire</Link>
                </p>
            </div>
        </div>
    )
}
