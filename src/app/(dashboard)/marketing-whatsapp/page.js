'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default function MarketingWhatsAppPage() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState(null)
    const [formData, setFormData] = useState({
        phone: '',
        accountId: '',
        token: ''
    })

    useEffect(() => {
        if (!user) return
        const fetchProfile = async () => {
            const { data } = await supabase.from('profiles').select('plan_tier').eq('id', user.id).single()
            setProfile(data || { plan_tier: 'free' })
            setLoading(false)
        }
        fetchProfile()
    }, [user])

    if (loading) return <div style={{ padding: 24 }}>Chargement...</div>

    const isLocked = profile?.plan_tier !== 'agency'

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>Marketing WhatsApp</h1>
            <p style={{ color: '#64748b', marginBottom: 32 }}>Envoyez des messages broadcast à vos clients sur WhatsApp.</p>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 600 }}>Configuration API Meta</h3>
                    {isLocked && <span style={{ background: '#e2e8f0', color: '#64748b', fontSize: 12, padding: '4px 8px', borderRadius: 4, fontWeight: 'bold' }}>AGENCE UNIQUEMENT</span>}
                </div>

                <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>
                    Pour envoyer des messages en masse, vous devez connecter votre compte WhatsApp Business API.
                </p>

                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Numéro de téléphone WhatsApp Business</label>
                    <Input
                        placeholder="+1 234 567 890"
                        disabled={isLocked}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                </div>

                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>ID du compte WhatsApp Business</label>
                    <Input
                        placeholder="1000..."
                        disabled={isLocked}
                        value={formData.accountId}
                        onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                    />
                </div>

                <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Token d'accès API (Permanent)</label>
                    <Input
                        type="password"
                        placeholder="EAAG..."
                        disabled={isLocked}
                        value={formData.token}
                        onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                    />
                </div>

                <Button disabled={isLocked}>Sauvegarder la configuration</Button>

                {isLocked && (
                    <div style={{ marginTop: 24, padding: 16, background: '#fee2e2', borderRadius: 8, border: '1px solid #fecaca' }}>
                        <p style={{ fontSize: 14, color: '#dc2626', marginBottom: 8 }}>
                            🔒 Cette fonctionnalité est réservée aux abonnements <strong>Agence (249€/mois)</strong>.
                        </p>
                        <Link href="/billing">
                            <Button variant="outline" style={{ borderColor: '#dc2626', color: '#dc2626' }}>
                                Mettre à niveau
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
