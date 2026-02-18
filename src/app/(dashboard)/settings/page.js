'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Lock, LogOut, CreditCard, Trash2, AlertTriangle, CheckCircle } from 'lucide-react'
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
                                    style={{ background: '#f1f5f9', color: '#64748b' }}
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
                                    <Input
                                        type="password"
                                        value={passwords.newPassword}
                                        onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                                        placeholder="••••••••"
                                        className={styles.input}
                                    />
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Confirmer le mot de passe</label>
                                    <Input
                                        type="password"
                                        value={passwords.confirmPassword}
                                        onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                        placeholder="••••••••"
                                        className={styles.input}
                                    />
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
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>
                                Plan Actuel : <span className={styles.planName}>{profile.plan_tier}</span>
                            </div>
                            <p className={styles.helperText}>Gérez votre abonnement, factures et méthode de paiement.</p>
                        </div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            {profile.plan_tier !== 'free' ? (
                                <Button
                                    size="md"
                                    onClick={async () => {
                                        if (!confirm('Êtes-vous sûr de vouloir résilier votre abonnement et repasser au plan Gratuit ?')) return;

                                        setLoading(true);
                                        try {
                                            // Check limits
                                            const { count } = await supabase
                                                .from('chatbots')
                                                .select('*', { count: 'exact', head: true })
                                                .eq('user_id', user.id);

                                            if (count > 1) {
                                                alert(`Impossible de se désabonner : Vous avez ${count} chatbots. Le plan Gratuit n'en autorise qu'un seul. Veuillez en supprimer avant de résilier.`);
                                                setLoading(false);
                                                return;
                                            }

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
                                    style={{ minWidth: '220px', justifyContent: 'center' }}
                                >
                                    Se désabonner
                                </Button>
                            ) : (
                                <Link href="/billing">
                                    <Button size="md" style={{ minWidth: '220px', justifyContent: 'center' }}>Gérer mon plan</Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>Changer de compte</div>
                            <p className={styles.helperText}>Déconnectez-vous pour utiliser un autre compte.</p>
                        </div>
                        <Button size="md" onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: '220px', justifyContent: 'center' }}>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>Supprimer le compte</div>
                            <p className={styles.helperText}>Cette action est irréversible. Toutes vos données seront effacées.</p>
                        </div>
                        <Button
                            variant="ghost"
                            style={{ color: '#ef4444', backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}
                            onClick={() => {
                                if (confirm('Êtes-vous ABSOLUMENT sûr ? Cette action est irréversible.')) {
                                    alert('Veuillez contacter le support pour supprimer définitivement votre compte par mesure de sécurité.')
                                }
                            }}
                        >
                            Supprimer mon compte
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
