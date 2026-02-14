'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Lock, LogOut, CreditCard, Trash2, AlertTriangle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

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

            // Determine if email changed (complex flow, usually requires re-confirmation)
            // For MVP, we might skip email update or warn user. 
            // supabase.auth.updateUser({ email: ... }) sends confirmation to BOTH emails.

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

    if (loading) return <div style={{ padding: 40 }}>Chargement...</div>

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 40 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: '#1e293b' }}>Paramètres</h1>
            <p style={{ color: '#64748b', marginBottom: 32 }}>Gérez votre profil, votre sécurité et vos préférences.</p>

            {message && (
                <div style={{
                    padding: '12px 16px',
                    borderRadius: 8,
                    marginBottom: 24,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    background: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
                    color: message.type === 'success' ? '#059669' : '#dc2626',
                    border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`
                }}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                    {message.text}
                </div>
            )}

            {/* Profile Section */}
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 24 }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                            <User size={18} />
                        </div>
                        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a' }}>Profil Personnel</h2>
                    </div>
                </div>
                <div style={{ padding: 24 }}>
                    <form onSubmit={handleUpdateProfile}>
                        <div style={{ display: 'grid', gap: 20 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6 }}>Nom complet</label>
                                <Input
                                    value={profile.full_name}
                                    onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                                    placeholder="Jean Dupont"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6 }}>Email</label>
                                <Input
                                    value={profile.email}
                                    disabled
                                    style={{ background: '#f1f5f9', color: '#64748b' }}
                                />
                                <p style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>L&apos;adresse email ne peut pas être modifiée ici.</p>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button type="submit" disabled={saving}>
                                    {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Security Section */}
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 24 }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                            <Lock size={18} />
                        </div>
                        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a' }}>Sécurité</h2>
                    </div>
                </div>
                <div style={{ padding: 24 }}>
                    <form onSubmit={handleUpdatePassword}>
                        <div style={{ display: 'grid', gap: 20 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6 }}>Nouveau mot de passe</label>
                                    <Input
                                        type="password"
                                        value={passwords.newPassword}
                                        onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6 }}>Confirmer le mot de passe</label>
                                    <Input
                                        type="password"
                                        value={passwords.confirmPassword}
                                        onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button type="submit" variant="outline" disabled={saving || !passwords.newPassword}>
                                    Mettre à jour le mot de passe
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Subscription & Account Section */}
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 24 }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                            <CreditCard size={18} />
                        </div>
                        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a' }}>Abonnement et Compte</h2>
                    </div>
                </div>
                <div style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #f1f5f9' }}>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>Plan Actuel : <span style={{ textTransform: 'capitalize', color: '#2563eb' }}>{profile.plan_tier}</span></div>
                            <p style={{ fontSize: 13, color: '#64748b' }}>Gérez votre abonnement, factures et méthode de paiement.</p>
                        </div>
                        <Link href="/billing">
                            <Button variant="outline">Gérer / Se désabonner</Button>
                        </Link>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>Changer de compte</div>
                            <p style={{ fontSize: 13, color: '#64748b' }}>Déconnectez-vous pour utiliser un autre compte.</p>
                        </div>
                        <Button variant="outline" onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <LogOut size={16} />
                            Déconnexion
                        </Button>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div style={{ background: '#fff1f2', borderRadius: 12, border: '1px solid #fecaca', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #fecaca', background: '#ffe4e6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
                            <Trash2 size={18} />
                        </div>
                        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#991b1b' }}>Zone de Danger</h2>
                    </div>
                </div>
                <div style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#991b1b', marginBottom: 4 }}>Supprimer le compte</div>
                            <p style={{ fontSize: 13, color: '#ef4444' }}>Cette action est irréversible. Toutes vos données seront effacées.</p>
                        </div>
                        <Button
                            variant="destructive"
                            style={{ background: '#dc2626', color: 'white' }}
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
