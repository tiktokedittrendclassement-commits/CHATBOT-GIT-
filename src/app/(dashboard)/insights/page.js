'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Globe, MapPin, Users, Lock, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import styles from './page.module.css'

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
            <div className={styles.header}>
                <div>
                    <h1 className={styles.heading}>
                        Visiteurs
                        {!isAgency && <span className={styles.badgeAgency}>AGENCE</span>}
                    </h1>
                    <p className={styles.subheading}>Découvrez sur quelles pages vos utilisateurs interagissent avec vos chatbots.</p>
                </div>
            </div>

            {/* Banner for Non-Agency */}
            {!isAgency && (
                <div className={styles.banner}>
                    <div className={styles.bannerIcon}>
                        <Globe size={24} />
                    </div>
                    <div className={styles.bannerContent}>
                        <h3>Fonctionnalité Agence</h3>
                        <p>
                            Passez au plan Agence pour débloquer le suivi détaillé des visiteurs et les analyses de parcours.
                        </p>
                    </div>
                    <Link href="/billing" style={{ marginLeft: 'auto' }}>
                        <Button className={styles.upgradeBtn}>Upgrader</Button>
                    </Link>
                </div>
            )}

            <div className={styles.grid}>

                {/* Stats Card */}
                <div className={styles.card}>
                    <div className={styles.cardTitle}>Vue d'ensemble</div>
                    <div className={styles.statRow}>
                        <div className={styles.statIcon}>
                            <Users size={24} />
                        </div>
                        <div>
                            <div className={styles.statLabel}>Interactions Totales</div>
                            <div className={styles.statValue}>{isAgency ? totalVisits : '---'}</div>
                        </div>
                    </div>
                    <div className={styles.infoBox}>
                        Ces données sont basées sur les interactions avec les chatbots sur votre site web.
                    </div>
                </div>

                {/* Pages List */}
                <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 className={styles.cardTitle} style={{ marginBottom: 0 }}>Pages les plus visitées</h2>
                        <Globe size={16} className="text-slate-400" />
                    </div>

                    {isAgency && visitedPages.length > 0 ? (
                        <div>
                            {visitedPages.map((page, i) => (
                                <div key={i} className={styles.listItem} style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                                        <div className={styles.rank}>
                                            {i + 1}
                                        </div>
                                        <div style={{ overflow: 'hidden', minWidth: 0 }}>
                                            <a href={page.url} target="_blank" rel="noopener noreferrer" className={styles.urlLink}>
                                                {page.url}
                                                <ArrowUpRight size={12} />
                                            </a>
                                            <div className={styles.lastVisit}>
                                                Dernière visite : {new Date(page.last_visit).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.countBadge}>
                                        {page.count}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
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
