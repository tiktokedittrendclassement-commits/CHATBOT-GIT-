'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import styles from './page.module.css'
import { MessageSquare, Zap, CreditCard, ChevronRight, DollarSign, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
    const { user } = useAuth()
    const [profile, setProfile] = useState(null)
    const [stats, setStats] = useState({
        conversations: 0,
        chatbots: 0,
        messages: 0,
        revenue: 0
    })
    const [recentConversations, setRecentConversations] = useState([])
    const [revenueByBot, setRevenueByBot] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        const fetchData = async () => {
            try {
                // Fetch profile
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                setProfile(profileData)

                // Fetch stats
                // Chatbots count
                const { count: chatbotsCount, data: myBots } = await supabase
                    .from('chatbots')
                    .select('id, name', { count: 'exact' })
                    .eq('user_id', user.id)

                // Conversations count (via chatbots)
                const { count: conversationsCount } = await supabase
                    .from('conversations')
                    .select('*', { count: 'exact', head: true })
                // This assumes RLS filters conversations to only those owned by user's chatbots
                // If not, we'd need to filter by chatbot_id in (myBots IDs)

                // Messages count using RPC function
                const { data: messagesCount } = await supabase
                    .rpc('get_user_message_count', { p_user_id: user.id })

                // Fetch Sales Data
                let totalRevenue = 0
                let botRevenueMap = {}

                if (myBots?.length) {
                    const botIds = myBots.map(b => b.id)

                    // Initialize map
                    myBots.forEach(bot => {
                        botRevenueMap[bot.id] = { name: bot.name, amount: 0, count: 0 }
                    })

                    const { data: salesData } = await supabase
                        .from('sales')
                        .select('amount, chatbot_id')
                        .in('chatbot_id', botIds)

                    if (salesData) {
                        salesData.forEach(sale => {
                            totalRevenue += Number(sale.amount)
                            if (botRevenueMap[sale.chatbot_id]) {
                                botRevenueMap[sale.chatbot_id].amount += Number(sale.amount)
                                botRevenueMap[sale.chatbot_id].count += 1
                            }
                        })
                    }

                    // Recent Conversations
                    const { data: recentConvs } = await supabase
                        .from('conversations')
                        .select(`
                            id,
                            created_at,
                            visitor_id,
                            chatbots ( name )
                        `)
                        .in('chatbot_id', botIds)
                        .order('created_at', { ascending: false })
                        .limit(5)

                    setRecentConversations(recentConvs || [])
                }

                setStats({
                    conversations: conversationsCount || 0,
                    chatbots: chatbotsCount || 0,
                    messages: messagesCount || 0,
                    revenue: totalRevenue
                })

                // Convert map to array for display
                const revenueArray = Object.values(botRevenueMap)
                    .sort((a, b) => b.amount - a.amount)
                    .filter(item => item.amount > 0) // Only show bots with revenue? Or all? Let's show all if needed, but top earners first.

                setRevenueByBot(revenueArray)

            } catch (error) {
                console.error('Error fetching dashboard data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user])

    if (loading) return <div className={styles.loading}>Loading dashboard...</div>

    return (
        <div>
            <h1 className={styles.heading}>Tableau de bord</h1>
            <p className={styles.subheading}>Bon retour, {profile?.full_name || user?.email}</p>

            <div className={styles.grid}>
                {/* Active Chatbots Card */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardTitle}>Chatbots Actifs</span>
                        <MessageSquare size={20} className={styles.iconBlue} />
                    </div>
                    <div className={styles.cardValue}>{stats.chatbots}</div>
                    <div className={styles.cardDesc}>
                        <Link href="/chatbots" className={styles.link}>Gérer mes assistants</Link>
                    </div>
                </div>

                {/* Total Revenue Card */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardTitle}>Revenus Générés</span>
                        <DollarSign size={20} className={styles.iconGreen} />
                    </div>
                    <div className={styles.cardValue}>{stats.revenue.toFixed(2)} €</div>
                    <div className={styles.cardDesc}>Total des ventes via chatbots</div>
                </div>

                {/* Solde Restant (Credits) Card - RESTORED */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardTitle}>Solde Restant</span>
                        <Zap size={20} className={styles.iconYellow} />
                    </div>
                    <div className={styles.cardValue}>{((profile?.credits_balance || 0) / 1000000).toFixed(2)} €</div>
                    <div className={styles.cardDesc}>Recharge le mois prochain</div>
                </div>

                {/* Plan Card */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardTitle}>Plan Actuel</span>
                        <CreditCard size={20} className={styles.iconPurple} />
                    </div>
                    <div className={styles.cardValue} style={{ textTransform: 'capitalize' }}>
                        {profile?.plan_tier || 'Gratuit'}
                    </div>
                    <div className={styles.cardDesc}>
                        <Link href="/billing" className={styles.link}>Gérer l&apos;abonnement</Link>
                    </div>
                </div>

                {/* Message Usage Card */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardTitle}>Messages Envoyés</span>
                        <MessageSquare size={20} className={styles.iconBlue} />
                    </div>
                    {profile?.plan_tier === 'free' || !profile?.plan_tier ? (
                        <>
                            <div className={styles.cardValue}>
                                {stats.messages} / 1000
                            </div>
                            <div style={{ marginTop: 12, marginBottom: 8 }}>
                                <div style={{
                                    width: '100%',
                                    height: 8,
                                    background: '#e2e8f0',
                                    borderRadius: 4,
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${Math.min((stats.messages / 1000) * 100, 100)}%`,
                                        height: '100%',
                                        background: stats.messages >= 1000 ? '#ef4444' : stats.messages >= 800 ? '#f59e0b' : '#3b82f6',
                                        transition: 'width 0.3s ease'
                                    }} />
                                </div>
                            </div>
                            <div className={styles.cardDesc}>
                                {Math.round((stats.messages / 1000) * 100)}% utilisé
                            </div>
                        </>
                    ) : (
                        <>
                            <div className={styles.cardValue}>{stats.messages}</div>
                            <div className={styles.cardDesc}>Messages illimités ✨</div>
                        </>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginTop: 32 }}>

                {/* Revenue Breakdown */}
                <div className={styles.section} style={{ marginTop: 0 }}>
                    <div className={styles.sectionHeader}>
                        <h2>Revenus par Chatbot</h2>
                    </div>
                    <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
                        {revenueByBot.length > 0 ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, color: '#64748b' }}>Chatbot</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, color: '#64748b' }}>Ventes</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, color: '#64748b' }}>Revenu</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {revenueByBot.map((bot, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '12px 16px', fontWeight: 500 }}>{bot.name}</td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>{bot.count}</td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#10b981' }}>{bot.amount.toFixed(2)} €</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>
                                <TrendingUp size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
                                <p>Aucun revenu enregistré pour le moment.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Conversations */}
                <div className={styles.section} style={{ marginTop: 0 }}>
                    <div className={styles.sectionHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2>Conversations</h2>
                        <Link href="/conversations" className={styles.link}>
                            Voir tout <ChevronRight size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
                        </Link>
                    </div>
                    <div className={styles.conversationsList}>
                        {recentConversations.length > 0 ? (
                            recentConversations.map(conv => (
                                <Link key={conv.id} href={`/conversations/${conv.id}`} className={styles.conversationItem}>
                                    <div className={styles.conversationIcon}>
                                        <MessageSquare size={20} />
                                    </div>
                                    <div className={styles.conversationInfo}>
                                        <div className={styles.conversationBot}>{conv.chatbots?.name || 'Chatbot'}</div>
                                        <div className={styles.conversationVisitor}>Visiteur: {conv.visitor_id?.substring(0, 8) || 'Anonyme'}</div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className={styles.emptyState}>Aucune conversation</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
