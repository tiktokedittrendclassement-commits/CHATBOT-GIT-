'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import styles from '../login/page.module.css' // Reuse styles
import { ArrowLeft } from 'lucide-react'

export default function RegisterPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleRegister = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            })

            if (error) {
                setError(error.message)
            } else {
                // Email confirmation disabled, so user is signed in.
                // Redirect to dashboard.
                router.push('/dashboard')
                router.refresh()
            }
        } catch (err) {
            setError('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 13, marginBottom: 20, textDecoration: 'none' }}>
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
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="password">Mot de passe</label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
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
