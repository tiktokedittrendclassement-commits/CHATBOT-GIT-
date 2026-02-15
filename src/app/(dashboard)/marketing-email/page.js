'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Lock } from 'lucide-react'
import Link from 'next/link'
import styles from './page.module.css'

export default function MarketingEmailPage() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [chatbots, setChatbots] = useState([])
    const [profile, setProfile] = useState(null)

    useEffect(() => {
        if (!user) return
        const fetchData = async () => {
            const { data: prof } = await supabase.from('profiles').select('plan_tier').eq('id', user.id).single()
            setProfile(prof || { plan_tier: 'free' })

            const { data: bots } = await supabase.from('chatbots').select('*').eq('user_id', user.id)
            setChatbots(bots || [])
            setLoading(false)
        }
        fetchData()
    }, [user])

    const toggleEmailCollection = async (botId, currentStatus) => {
        if (profile?.plan_tier === 'free') return

        const { error } = await supabase
            .from('chatbots')
            .update({ collect_emails: !currentStatus })
            .eq('id', botId)

        if (error) {
            alert('Erreur: ' + error.message)
        } else {
            setChatbots(chatbots.map(b => b.id === botId ? { ...b, collect_emails: !currentStatus } : b))
        }
    }

    if (loading) return <div style={{ padding: 24 }}>Chargement...</div>

    const isLocked = profile?.plan_tier === 'free'

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.heading}>Marketing Email</h1>
                    <p className={styles.subheading}>Collectez des leads et envoyez des campagnes.</p>
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.cardTitle}>
                    Collecte de Leads
                    {isLocked && <span className={styles.badgePro}>PRO & AGENCE</span>}
                </div>

                <p className={styles.cardDescription}>
                    Activez la collecte d'emails sur vos chatbots pour construire votre liste de contacts automatiquement lors des discussions.
                </p>

                {chatbots.length > 0 ? (
                    <div>
                        {chatbots.map(bot => (
                            <div key={bot.id} className={styles.listItem}>
                                <div>
                                    <div className={styles.botName}>{bot.name}</div>
                                    <div className={styles.botId}>ID: {bot.id}</div>
                                </div>
                                <div className={styles.actions}>
                                    <span className={`${styles.status} ${bot.collect_emails && !isLocked ? styles.statusActive : styles.statusInactive}`}>
                                        {bot.collect_emails && !isLocked ? 'Activé' : 'Désactivé'}
                                    </span>
                                    <input
                                        type="checkbox"
                                        className={styles.checkbox}
                                        checked={!!(bot.collect_emails && !isLocked)}
                                        onChange={() => !isLocked && toggleEmailCollection(bot.id, bot.collect_emails)}
                                        disabled={isLocked}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>
                        Vous n'avez aucun chatbot. <Link href="/chatbots/new" style={{ color: '#673DE6', fontWeight: 600 }}>Créez-en un</Link> pour commencer.
                    </p>
                )}

                {isLocked && (
                    <div className={styles.lockedBox}>
                        <div style={{ background: '#EDE9FE', padding: 12, borderRadius: '50%', color: '#7C3AED' }}>
                            <Lock size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div className={styles.lockedText}>
                                Fonctionnalité Premium
                            </div>
                            <p className={styles.lockedSubText}>
                                La collecte d'emails est réservée aux plans Pro et Agence.
                            </p>
                        </div>
                        <Link href="/billing">
                            <Button className={styles.upgradeBtn} variant="outline">
                                Mettre à niveau
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            <div className={styles.futureBox}>
                <h3 className={styles.futureTitle}>Campagnes Email (Bientôt)</h3>
                <p className={styles.futureText}>L'envoi de newsletters et séquences automatisées sera disponible prochainement.</p>
            </div>
        </div>
    )
}
