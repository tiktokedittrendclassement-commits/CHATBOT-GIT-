'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Globe, MapPin, Users, Lock, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

export default function InsightsPage() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState(null)
    const [visitedPages, setVisitedPages] = useState([])
    const [totalVisits, setTotalVisits] = useState(0)

    useEffect(() => {
        if (!user) return

        const fetchData = async () => {
            // 1. Check Plan
            const { data: profileData } = await supabase
                .from('profiles')
                .select('plan_tier')
                .eq('id', user.id)
                .single()
            setProfile(profileData)

            if (profileData?.plan_tier !== 'agency') {
                setLoading(false)
                return
            }

            // 2. Fetch Message Data with URLs
            // We group by page_url manually since we can't do complex GROUP BY in client-side Supabase easy without RPC
            // So we fetch relevant messages and aggregate locally.
            // Fetch messages from user's chatbots

            // First get user's chatbot IDs
            const { data: bots } = await supabase.from('chatbots').select('id').eq('user_id', user.id)
            const botIds = bots?.map(b => b.id) || []

            if (botIds.length > 0) {
                const { data: messages } = await supabase
                    .from('messages')
                    .select('page_url, created_at, conversations!inner(chatbot_id)')
                    .eq('role', 'user')
                    .in('conversations.chatbot_id', botIds)
                    .not('page_url', 'is', null) // Only where URL exists
                    .order('created_at', { ascending: false })
                    .limit(500) // Limit sample

                if (messages) {
                    setTotalVisits(messages.length)

                    // Aggregate
                    const urlMap = {}
                    messages.forEach(msg => {
                        const url = msg.page_url
                        if (!urlMap[url]) {
                            urlMap[url] = { url, count: 0, last_visit: msg.created_at }
                        }
                        urlMap[url].count++
                    })

                    const sorted = Object.values(urlMap).sort((a, b) => b.count - a.count)
                    setVisitedPages(sorted)
                }
            }
            setLoading(false)
        }

        fetchData()
    }, [user])

    if (loading) return <div style={{ padding: 40 }}>Chargement...</div>

    const isAgency = profile?.plan_tier === 'agency';

    return (
        <div style={{ paddingBottom: 40 }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: '#1e293b' }}>
                    Insights Visiteurs
                    {!isAgency && <span style={{ fontSize: 12, background: '#e0e7ff', color: '#4338ca', padding: '4px 8px', borderRadius: 12, marginLeft: 12, verticalAlign: 'middle' }}>AGENCE</span>}
                </h1>
                <p style={{ color: '#64748b' }}>Découvrez sur quelles pages vos utilisateurs interagissent avec vos chatbots.</p>
            </div>

            {/* Banner for Non-Agency */}
            {!isAgency && (
                <div style={{
                    background: 'linear-gradient(to right, #eef2ff, #fff)',
                    border: '1px solid #c7d2fe',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 24,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16
                }}>
                    <div style={{ background: '#e0e7ff', padding: 10, borderRadius: '50%', color: '#4338ca' }}>
                        <Globe size={24} />
                    </div>
                    <div>
                        <h3 style={{ fontWeight: 600, color: '#3730a3', marginBottom: 4 }}>Fonctionnalité Agence</h3>
                        <p style={{ fontSize: 14, color: '#4338ca', margin: 0 }}>
                            Passez au plan Agence pour débloquer le suivi détaillé des visiteurs et les analyses de parcours.
                        </p>
                    </div>
                    <Link href="/billing" style={{ marginLeft: 'auto' }}>
                        <Button style={{ background: '#4338ca' }}>Upgrader</Button>
                    </Link>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, position: 'relative' }}>

                {/* Stats Card */}
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, height: 'fit-content' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                            <Users size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Interactions Totales</div>
                            <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>{isAgency ? totalVisits : '---'}</div>
                        </div>
                    </div>
                    <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8 }}>
                        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                            Ces données sont basées sur les interactions avec les chatbots sur votre site web.
                        </p>
                    </div>
                </div>

                {/* Pages List */}
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', minHeight: 300 }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: 16, fontWeight: 600 }}>Pages les plus visitées</h2>
                        <Globe size={16} className="text-slate-400" />
                    </div>

                    {isAgency && visitedPages.length > 0 ? (
                        <div>
                            {visitedPages.map((page, i) => (
                                <div key={i} style={{
                                    padding: '16px 24px',
                                    borderBottom: i === visitedPages.length - 1 ? 'none' : '1px solid #f1f5f9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, overflow: 'hidden' }}>
                                        <div style={{
                                            width: 28, height: 28, borderRadius: '50%', background: '#f1f5f9',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 12, fontWeight: 600, color: '#64748b', flexShrink: 0
                                        }}>
                                            {i + 1}
                                        </div>
                                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            <a href={page.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, fontWeight: 500, color: '#2563eb', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                {page.url}
                                                <ArrowUpRight size={12} />
                                            </a>
                                            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                                                Dernière visite : {new Date(page.last_visit).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{
                                            background: '#eff6ff', color: '#1d4ed8',
                                            padding: '4px 10px', borderRadius: 12,
                                            fontSize: 12, fontWeight: 600
                                        }}>
                                            {page.count} interactions
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                            <MapPin size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
                            <p>{isAgency ? 'Aucune donnée de visite enregistrée pour le moment.' : 'Données réservées aux Agences.'}</p>
                            {!isAgency && <p style={{ fontSize: 12, marginTop: 8 }}>Upgradez votre plan pour voir les détails.</p>}
                            {isAgency && <p style={{ fontSize: 12, marginTop: 8 }}>Assurez-vous que votre chatbot est bien installé sur votre site.</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Updated v2 - Removed Overlays
