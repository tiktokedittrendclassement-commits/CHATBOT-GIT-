'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import styles from '../login/page.module.css' // Reuse styles
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [fullName, setFullName] = useState('')
    const [isRegistered, setIsRegistered] = useState(false)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleRegister = async (e) => {
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
            const { data, error } = await supabase.auth.signUp({
                email: trimmedEmail,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/login`,
                    data: {
                        full_name: fullName,
                    },
                },
            })

            if (error) {
                if (error.message === 'User already registered') {
                    setError("Cet utilisateur est déjà enregistré.")
                } else if (error.message === 'Password should be at least 6 characters') {
                    setError("Le mot de passe doit contenir au moins 6 caractères.")
                } else {
                    setError(error.message)
                }
                return
            }

            // Check if email confirmation is required (session will be null)
            if (!data.session) {
                setIsRegistered(true)
            } else {
                router.push('/dashboard')
                router.refresh()
            }
        } catch (err) {
            setError('Une erreur inattendue est survenue')
        } finally {
            setLoading(false)
        }
    }

    if (isRegistered) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <h1 className={styles.title}>Presque fini !</h1>
                    <p className={styles.subtitle}>Un email de confirmation a été envoyé à <strong>{email}</strong>.</p>
                    <p className={styles.text} style={{ color: 'rgba(255,255,255,0.6)', marginTop: 20, textAlign: 'center' }}>
                        Veuillez cliquer sur le lien dans l'email pour activer votre compte.
                    </p>
                    <div style={{ marginTop: 30, textAlign: 'center' }}>
                        <Link href="/login">
                            <Button className={styles.submit}>Aller à la page de connexion</Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <Link href="/" className={styles.backLink}>
                    <ArrowLeft size={14} />
                    Retour à l&apos;accueil
                </Link>
                <h1 className={styles.title}>Créer un compte</h1>
                <p className={styles.subtitle}>Commencez avec Vendo aujourd&apos;hui</p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleRegister} className={styles.form}>
                    <div className={styles.field}>
                        <label htmlFor="fullName">Nom Complet</label>
                        <Input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Jean Dupont"
                            required
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

                    <Button type="submit" disabled={loading} className={styles.submit}>
                        {loading ? 'Création...' : 'Créer un compte'}
                    </Button>
                </form>

                <p className={styles.footer}>
                    Vous avez déjà un compte ? <Link href="/login">Se connecter</Link>
                </p>
            </div>
        </div>
    )
}
