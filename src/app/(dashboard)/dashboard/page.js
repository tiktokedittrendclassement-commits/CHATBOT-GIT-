'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import styles from './page.module.css'
import { MessageSquare, Zap, CreditCard, ChevronRight, DollarSign, TrendingUp, Plus, User, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

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

                // Messages count using RPC
                const { data: messagesCount } = await supabase
                    .rpc('get_user_message_count', { p_user_id: user.id })

                // Fetch Sales Data
                let totalRevenue = 0
                let botRevenueMap = {}
                let convsCount = 0

                if (myBots?.length) {
                    const botIds = myBots.map(b => b.id)

                    // Init map
                    myBots.forEach(bot => {
                        botRevenueMap[bot.id] = { name: bot.name, amount: 0, count: 0 }
                    })

                    // Get sales
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

                    // Count conversations
                    const { count } = await supabase
                        .from('conversations')
                        .select('*', { count: 'exact', head: true })
                        .in('chatbot_id', botIds)
                    convsCount = count || 0

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
                    conversations: convsCount,
                    chatbots: chatbotsCount || 0,
                    messages: messagesCount || 0,
                    revenue: totalRevenue
                })

                // Convert map to array for display
                const revenueArray = Object.values(botRevenueMap)
                    .sort((a, b) => b.amount - a.amount)

                setRevenueByBot(revenueArray)

            } catch (error) {
                if (error.name === 'AbortError') return;
                console.error('Error fetching dashboard data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user])

    if (loading) return <div className={styles.loading}>Chargement du tableau de bord...</div>

    // Calculate max revenue for chart scaling
    const maxRevenue = Math.max(...revenueByBot.map(b => b.amount), 100)

    return (
        <div className={styles.container}>
            {/* Header / Welcome Banner - Style Minimaliste Pro */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.heading}>
                        Hello, {profile?.full_name?.split(' ')[0] || 'Premium Member'}
                    </h1>
                    <p className={styles.subheading}>Here is your business overview for today.</p>
                </div>
                <div className={styles.headerActions}>
                    <Link href="/billing">
                        <Button variant="outline" size="lg">
                            <CreditCard size={18} style={{ marginRight: 8 }} /> Abonnement
                        </Button>
                    </Link>
                    <Link href="/chatbots/new">
                        <Button size="lg">
                            <Plus size={18} style={{ marginRight: 8 }} /> Nouveau Assistant
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className={styles.grid}>
                {/* Revenue Card */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div>
                            <div className={styles.cardTitle}>Revenus Totaux</div>
                            <div className={styles.cardValue}>{stats.revenue.toFixed(2)} €</div>
                        </div>
                        <div className={styles.iconBox}>
                            <DollarSign size={24} />
                        </div>
                    </div>
                    {/* Suppression du +12% fictif */}
                </div>

                {/* Wallet Balance Card (New) */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div>
                            <div className={styles.cardTitle}>Solde Compte</div>
                            <div className={styles.cardValue}>
                                {((profile?.credits_balance || 0) / 1000000).toFixed(2)} €
                            </div>
                        </div>
                        <div className={styles.iconBox}>
                            {/* Wallet icon not imported, using CreditCard as placeholder or if imported previously */}
                            <div style={{ fontWeight: '900', fontSize: '20px' }}>€</div>
                        </div>
                    </div>
                    <div className={styles.cardDesc}>
                        <Link href="/wallet" className={styles.link}>
                            Recharger <ArrowUpRight size={16} />
                        </Link>
                    </div>
                </div>

                {/* Msg Credit Card */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div>
                            <div className={styles.cardTitle}>Messages Envoyés</div>
                            <div className={styles.cardValue}>{stats.messages} <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>/ {profile?.plan_tier === 'free' ? '1000' : '∞'}</span></div>
                        </div>
                        <div className={styles.iconBox}>
                            <MessageSquare size={24} />
                        </div>
                    </div>

                    {profile?.plan_tier === 'free' && (
                        <>
                            <div className={styles.progressContainer}>
                                <div
                                    className={styles.progressBar}
                                    style={{ width: `${Math.min((stats.messages / 1000) * 100, 100)}%` }}
                                />
                            </div>
                            <div className={styles.cardDesc}>
                                <span>Limite de 1000 messages (Non renouvelable)</span>
                            </div>
                        </>
                    )}
                    {profile?.plan_tier !== 'free' && (
                        <div className={styles.cardDesc} style={{ marginTop: 12 }}>
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 500, fontSize: '13px' }}>Volume illimité activé</span>
                        </div>
                    )}
                </div>

                {/* Chatbots Card */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div>
                            <div className={styles.cardTitle}>Chatbots Actifs</div>
                            <div className={styles.cardValue}>{stats.chatbots}</div>
                        </div>
                        <div className={styles.iconBox}>
                            <Zap size={24} />
                        </div>
                    </div>
                    <div className={styles.cardDesc}>
                        <Link href="/chatbots" className={styles.link}>
                            Gérer mes bots <ArrowUpRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Split Section: Revenue Chart & Recent Convs */}
            <div className={styles.mainLayout}>
                {/* Left: Revenue Visualization */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>Performance par Chatbot</h2>
                    </div>

                    {/* Visual Bar Chart */}
                    <div className={styles.chartContainer}>
                        {revenueByBot.length > 0 ? (
                            revenueByBot.slice(0, 5).map((bot, idx) => (
                                <div key={idx} className={styles.chartBarWrapper}>
                                    <div className={styles.chartValue}>{bot.amount}€</div>
                                    <div
                                        className={`${styles.chartBar} ${idx === 0 ? styles.active : ''}`}
                                        style={{ height: `${(bot.amount / maxRevenue) * 100}%` }}
                                        title={`${bot.name}: ${bot.amount}€`}
                                    />
                                    <div className={styles.chartLabel}>{bot.name.substring(0, 10)}</div>
                                </div>
                            ))
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)' }}>
                                Pas de données de vente
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: 'auto' }}>
                        <Link href="/insights" className={styles.link}>
                            Voir les statistiques détaillées <ChevronRight size={16} />
                        </Link>
                    </div>
                </div>

                {/* Right: Recent Activity */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>Activité Récente</h2>
                    </div>

                    <div className={styles.list}>
                        {recentConversations.length > 0 ? (
                            recentConversations.map(conv => (
                                <Link key={conv.id} href={`/conversations/${conv.id}`} className={styles.listItem}>
                                    <div className={styles.navIcon}>
                                        <User size={18} />
                                    </div>
                                    <div className={styles.itemInfo}>
                                        <div className={styles.itemTitle}>
                                            {conv.visitor_id ? `Visiteur #${conv.visitor_id.substring(0, 4)}` : 'Nouveau Visiteur'}
                                        </div>
                                        <div className={styles.itemSub}>
                                            sur {conv.chatbots?.name} • {new Date(conv.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <ChevronRight size={16} color="#cbd5e1" />
                                </Link>
                            ))
                        ) : (
                            <div className={styles.emptyState}>
                                <MessageSquare size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
                                <p>En attente de conversations...</p>
                            </div>
                        )}
                    </div>

                    {recentConversations.length > 0 && (
                        <div style={{ marginTop: 24, textAlign: 'center' }}>
                            <Link href="/conversations" className={styles.link} style={{ justifyContent: 'center' }}>
                                Accéder à la boîte de réception
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
