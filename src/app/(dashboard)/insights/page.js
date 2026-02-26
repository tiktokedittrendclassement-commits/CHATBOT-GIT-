'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Globe, MapPin, Users, Lock, ArrowUpRight } from 'lucide-react'
import { CustomSelect } from '@/components/ui/custom-select'
import { PlanRestriction } from '@/components/ui/plan-restriction'
import Link from 'next/link'
import styles from './page.module.css'

export default function InsightsPage() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState(null)
    const [visitedPages, setVisitedPages] = useState([])
    const [totalVisits, setTotalVisits] = useState(0)
    const [chatbots, setChatbots] = useState([])
    const [selectedBotId, setSelectedBotId] = useState('all')

    useEffect(() => {
        if (!user) return

        const fetchData = async () => {
            // 1. Check Plan
            // 1. Check Plan
            const { data: profileData } = await supabase
                .from('profiles')
                .select('plan_tier')
                .eq('id', user.id)
                .single()
            setProfile(profileData)

            // 2. Fetch User's Chatbots
            const { data: bots } = await supabase.from('chatbots').select('id, name').eq('user_id', user.id)
            setChatbots(bots || [])

            const botIds = selectedBotId === 'all'
                ? (bots?.map(b => b.id) || [])
                : [selectedBotId]

            if (botIds.length > 0) {
                const { data: messages } = await supabase
                    .from('messages')
                    .select('page_url, created_at, conversations!inner(chatbot_id)')
                    .eq('role', 'user')
                    .in('conversations.chatbot_id', botIds)
                    .order('created_at', { ascending: false })
                    .limit(1000) // Increase sample

                if (messages) {
                    setTotalVisits(messages.length)

                    // Aggregate
                    const urlMap = {}
                    messages.forEach(msg => {
                        const url = msg.page_url || 'Direct / Interne'
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
    }, [user, selectedBotId])

    if (loading) return <div style={{ padding: 40 }}>Chargement...</div>

    const isAgency = profile?.plan_tier === 'agency';

    return (
        <div style={{ paddingBottom: 40 }}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.heading}>
                        Visiteurs
                    </h1>
                    <p className={styles.subheading}>Découvrez sur quelles pages vos utilisateurs interagissent avec vos chatbots.</p>
                </div>
                {chatbots.length > 0 && (
                    <div className={styles.filterContainer}>
                        <CustomSelect
                            options={[
                                { value: 'all', label: 'Tous les chatbots' },
                                ...chatbots.map(bot => ({ value: bot.id, label: bot.name }))
                            ]}
                            value={selectedBotId}
                            onChange={(val) => setSelectedBotId(val)}
                        />
                    </div>
                )}
            </div>

            <div style={{ position: 'relative' }}>
                {!isAgency && (
                    <PlanRestriction
                        tier="Agence"
                        description="Analysez le parcours de vos visiteurs et identifiez les pages qui convertissent le mieux. Réservé aux comptes <strong>Agence</strong>."
                        isOverlay={false}
                    />
                )}
                <div style={{ pointerEvents: 'auto', opacity: 1 }}>
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
                                    <div className={styles.statValue}>{totalVisits}</div>
                                </div>
                            </div>
                            <div className={styles.infoBox}>
                                Ces données sont basées sur les interactions avec les chatbots sur votre site web.
                            </div>
                        </div>

                        {/* Pages List */}
                        <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 className={styles.cardTitle} style={{ marginBottom: 0 }}>Pages les plus visitées</h2>
                                <Globe size={16} style={{ opacity: 0.5 }} />
                            </div>

                            {visitedPages.length > 0 ? (
                                <div>
                                    {visitedPages.map((page, i) => (
                                        <div key={i} className={styles.listItem} style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                                                <div className={styles.rank}>
                                                    {i + 1}
                                                </div>
                                                <div style={{ overflow: 'hidden', minWidth: 0 }}>
                                                    <a href={page.url.startsWith('http') ? page.url : '#'} target="_blank" rel="noopener noreferrer" className={styles.urlLink}>
                                                        {page.url}
                                                        {page.url.startsWith('http') && <ArrowUpRight size={12} />}
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
                                    <p>Aucune donnée de visite enregistrée pour le moment.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Updated v2 - Removed Overlays
