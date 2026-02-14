'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

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
        <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>Marketing Email</h1>
            <p style={{ color: '#64748b', marginBottom: 32 }}>Collectez des leads et envoyez des campagnes.</p>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 600 }}>Collecte de Leads</h3>
                    {isLocked && <span style={{ background: '#e2e8f0', color: '#64748b', fontSize: 12, padding: '4px 8px', borderRadius: 4, fontWeight: 'bold' }}>PRO & AGENCE</span>}
                </div>

                <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>Activez la collecte d'emails sur vos chatbots pour construire votre liste de contacts.</p>

                {chatbots.map(bot => (
                    <div key={bot.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                        <div>
                            <div style={{ fontWeight: 500 }}>{bot.name}</div>
                            <div style={{ fontSize: 12, color: '#94a3b8' }}>ID: {bot.id}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 14, color: bot.collect_emails && !isLocked ? '#16a34a' : '#64748b' }}>
                                {bot.collect_emails && !isLocked ? 'Activé' : 'Désactivé'}
                            </span>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="checkbox"
                                    checked={bot.collect_emails || false}
                                    onChange={() => toggleEmailCollection(bot.id, bot.collect_emails)}
                                    disabled={isLocked}
                                    style={{ width: 16, height: 16, cursor: isLocked ? 'not-allowed' : 'pointer' }}
                                />
                            </div>
                        </div>
                    </div>
                ))}

                {chatbots.length === 0 && <p className="text-gray-500">Vous n'avez aucun chatbot.</p>}

                {isLocked && (
                    <div style={{ marginTop: 24, padding: 16, background: '#fee2e2', borderRadius: 8, border: '1px solid #fecaca' }}>
                        <p style={{ fontSize: 14, color: '#dc2626', marginBottom: 8 }}>
                            🔒 Cette fonctionnalité n'est pas disponible dans le plan Gratuit.
                        </p>
                        <Link href="/billing">
                            <Button variant="outline" style={{ borderColor: '#dc2626', color: '#dc2626' }}>
                                Mettre à niveau
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            <div style={{ marginTop: 32, background: '#f8fafc', padding: 24, borderRadius: 8, textAlign: 'center' }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Campagnes Email (Bientôt)</h3>
                <p style={{ fontSize: 14, color: '#64748b' }}>L'envoi de newsletters sera disponible prochainement.</p>
            </div>
        </div>
    )
}
