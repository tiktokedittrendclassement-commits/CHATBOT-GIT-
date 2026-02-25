'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Lock, LogOut, CreditCard, Trash2, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import styles from './page.module.css'

export default function SettingsPage() {
    const { user, signOut } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState(null) // { type: 'success' | 'error', text: '' }

    const [profile, setProfile] = useState({
        full_name: '',
        email: '',
        plan_tier: 'free'
    })

    const [passwords, setPasswords] = useState({
        newPassword: '',
        confirmPassword: ''
    })
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    useEffect(() => {
        if (!user) return

        const getProfile = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (data) {
                setProfile({
                    full_name: data.full_name || '',
                    email: data.email || user.email,
                    plan_tier: data.plan_tier || 'free'
                })
            }
            setLoading(false)
        }

        getProfile()
    }, [user])

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        setSaving(true)
        setMessage(null)

        try {
            // Update table profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ full_name: profile.full_name })
                .eq('id', user.id)

            if (profileError) throw profileError

            setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' })
        } catch (error) {
            setMessage({ type: 'error', text: error.message })
        } finally {
            setSaving(false)
        }
    }

    const handleUpdatePassword = async (e) => {
        e.preventDefault()
        if (passwords.newPassword !== passwords.confirmPassword) {
            setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' })
            return
        }
        if (passwords.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 6 caractères.' })
            return
        }

        setSaving(true)
        setMessage(null)

        try {
            const { error } = await supabase.auth.updateUser({
                password: passwords.newPassword
            })

            if (error) throw error

            setMessage({ type: 'success', text: 'Mot de passe mis à jour !' })
            setPasswords({ newPassword: '', confirmPassword: '' })
        } catch (error) {
            setMessage({ type: 'error', text: error.message })
        } finally {
            setSaving(false)
        }
    }

    const handleSignOut = async () => {
        await signOut()
        router.push('/login')
    }

    const handleDeleteAccount = async () => {
        if (!confirm('Êtes-vous ABSOLUMENT sûr ? Cette action est irréversible et supprimera TOUTES vos données (bots, conversations, crédits).')) {
            return
        }

        setSaving(true)
        setMessage(null)

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error('Session non trouvée')

            const response = await fetch('/api/auth/delete-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                }
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Erreur lors de la suppression du compte')
            }

            // Successfully deleted
            alert('Votre compte a été supprimé avec succès.')
            await signOut()
            router.push('/register')
        } catch (error) {
            console.error('Deletion error:', error)
            setMessage({ type: 'error', text: error.message })
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div style={{ padding: 40 }}>Chargement des paramètres...</div>

    return (
        <div className={styles.container}>
            <h1 className={styles.heading}>Paramètres</h1>
            <p className={styles.subheading}>Gérez votre profil, votre sécurité et vos préférences.</p>

            {message && (
                <div className={`${styles.message} ${message.type === 'success' ? styles.successMessage : styles.errorMessage}`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                    {message.text}
                </div>
            )}

            {/* Profile Section */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div className={styles.iconWrapper}>
                        <User size={18} />
                    </div>
                    <h2 className={styles.sectionTitle}>Profil Personnel</h2>
                </div>
                <div className={styles.sectionContent}>
                    <form onSubmit={handleUpdateProfile}>
                        <div className={styles.formGrid}>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Nom complet</label>
                                <Input
                                    value={profile.full_name}
                                    onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                                    placeholder="Jean Dupont"
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Email</label>
                                <Input
                                    value={profile.email}
                                    disabled
                                    style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.1)' }}
                                    className={styles.input}
                                />
                                <p className={styles.helperText}>L'adresse email ne peut pas être modifiée ici.</p>
                            </div>
                            <div className={styles.actions}>
                                <Button type="submit" disabled={saving} size="md" style={{ minWidth: '220px' }}>
                                    {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Security Section */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div className={styles.iconWrapper}>
                        <Lock size={18} />
                    </div>
                    <h2 className={styles.sectionTitle}>Sécurité</h2>
                </div>
                <div className={styles.sectionContent}>
                    <form onSubmit={handleUpdatePassword}>
                        <div className={styles.formGrid}>
                            <div className={styles.twoCols}>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Nouveau mot de passe</label>
                                    <div className={styles.passwordWrapper}>
                                        <Input
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={passwords.newPassword}
                                            onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                                            placeholder="••••••••"
                                            className={styles.passwordInput}
                                        />
                                        <button
                                            type="button"
                                            className={styles.passwordToggle}
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            tabIndex="-1"
                                        >
                                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Confirmer le mot de passe</label>
                                    <div className={styles.passwordWrapper}>
                                        <Input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={passwords.confirmPassword}
                                            onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                            placeholder="••••••••"
                                            className={styles.passwordInput}
                                        />
                                        <button
                                            type="button"
                                            className={styles.passwordToggle}
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            tabIndex="-1"
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.actions}>
                                <Button type="submit" size="md" disabled={saving || !passwords.newPassword} style={{ minWidth: '220px' }}>
                                    Mettre à jour le mot de passe
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Subscription & Account Section */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div className={styles.iconWrapper}>
                        <CreditCard size={18} />
                    </div>
                    <h2 className={styles.sectionTitle}>Abonnement et Compte</h2>
                </div>
                <div className={styles.sectionContent}>
                    <div className={styles.planRow}>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>
                                Plan Actuel : <span className={styles.planName}>{profile.plan_tier}</span>
                            </div>
                            <p className={styles.helperText}>Gérez votre abonnement, factures et méthode de paiement.</p>
                        </div>
                        <div className={styles.actionsWrapper}>
                            {profile.plan_tier !== 'free' ? (
                                <Button
                                    size="md"
                                    onClick={async () => {
                                        if (!confirm('Êtes-vous sûr de vouloir résilier votre abonnement et repasser au plan Gratuit ?')) return;

                                        setLoading(true);
                                        try {
                                            // Downgrade
                                            await supabase
                                                .from('profiles')
                                                .update({ plan_tier: 'free' })
                                                .eq('id', user.id);

                                            // Rename bot
                                            await supabase
                                                .from('chatbots')
                                                .update({ name: 'Mon Assistant Vendo' })
                                                .eq('user_id', user.id);

                                            alert('Votre abonnement a été résilié. Vous êtes maintenant sur le plan Gratuit.');
                                            window.location.reload();
                                        } catch (err) {
                                            alert('Erreur: ' + err.message);
                                            setLoading(false);
                                        }
                                    }}
                                    className={styles.actionBtn}
                                >
                                    Se désabonner
                                </Button>
                            ) : (
                                <Link href="/billing" className={styles.actionBtnLink}>
                                    <Button size="md" className={styles.actionBtn}>Gérer mon plan</Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className={styles.dangerZoneRow}>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Changer de compte</div>
                            <p className={styles.helperText}>Déconnectez-vous pour utiliser un autre compte.</p>
                        </div>
                        <Button size="md" onClick={handleSignOut} className={styles.actionBtn}>
                            <LogOut size={16} />
                            Déconnexion
                        </Button>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}

            {/* Account Deletion - Clean Style */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div className={styles.iconWrapper}>
                        <Trash2 size={18} />
                    </div>
                    <h2 className={styles.sectionTitle}>Zone de Danger</h2>
                </div>
                <div className={styles.sectionContent}>
                    <div className={styles.dangerZoneRow}>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Supprimer le compte</div>
                            <p className={styles.helperText}>Cette action est irréversible. Toutes vos données seront effacées.</p>
                        </div>
                        <Button
                            variant="ghost"
                            disabled={saving}
                            style={{
                                color: '#ef4444',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                cursor: saving ? 'not-allowed' : 'pointer',
                                opacity: saving ? 0.7 : 1
                            }}
                            onClick={handleDeleteAccount}
                        >
                            {saving ? 'Suppression...' : 'Supprimer mon compte'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
