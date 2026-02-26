'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Lock } from 'lucide-react'
import { PlanRestriction } from '@/components/ui/plan-restriction'
import styles from './page.module.css'

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
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.heading}>Marketing WhatsApp</h1>
                    <p className={styles.subheading}>Envoyez des messages broadcast à vos clients sur WhatsApp.</p>
                </div>
            </div>

            <div style={{ position: 'relative' }}>
                {isLocked && (
                    <PlanRestriction
                        tier="Agence"
                        description="Cette fonctionnalité est réservée aux abonnements <strong>Agence</strong>."
                        isOverlay={false}
                    />
                )}

                <div style={{ pointerEvents: 'auto', opacity: 1 /* Always visible */ }}>
                    <div className={styles.card}>
                        <div className={styles.cardTitle}>
                            Configuration API Meta
                        </div>

                        <p className={styles.cardDescription}>
                            Pour envoyer des messages en masse, vous devez connecter votre compte WhatsApp Business API.
                        </p>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Numéro de téléphone WhatsApp Business</label>
                            <Input
                                placeholder="+1 234 567 890"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>ID du compte WhatsApp Business</label>
                            <Input
                                placeholder="1000..."
                                value={formData.accountId}
                                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Token d'accès API (Permanent)</label>
                            <Input
                                type="password"
                                placeholder="EAAG..."
                                value={formData.token}
                                onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                            />
                        </div>
                    </div>

                    <Button
                        onClick={() => {
                            if (isLocked) {
                                alert('Cette configuration est réservée aux membres Agence. (Mode Démo)')
                                return
                            }
                        }}
                        className={styles.saveBtn}
                    >
                        Sauvegarder la configuration
                    </Button>

                    <div className={styles.infoBox}>
                        Note : L'envoi de messages WhatsApp est soumis aux politiques de Meta et peut engendrer des coûts supplémentaires par conversation.
                    </div>
                </div>

            </div>
        </div>
    )
}
