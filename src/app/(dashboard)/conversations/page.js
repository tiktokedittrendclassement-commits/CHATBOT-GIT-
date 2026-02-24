'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import Link from 'next/link'
import { MessageSquare, ChevronRight } from 'lucide-react'
import { CustomSelect } from '@/components/ui/custom-select'
import { formatDate } from '@/lib/utils'
import styles from './page.module.css'

export default function ConversationsPage() {
    const { user } = useAuth()
    const [conversations, setConversations] = useState([])
    const [chatbots, setChatbots] = useState([])
    const [selectedBotId, setSelectedBotId] = useState('all')
    const [loading, setLoading] = useState(true)

    // Fetch Chatbots for filter
    useEffect(() => {
        if (!user) return
        const fetchBots = async () => {
            const { data } = await supabase
                .from('chatbots')
                .select('id, name')
                .eq('user_id', user.id)
            setChatbots(data || [])
        }
        fetchBots()
    }, [user])

    // Fetch Conversations based on filter
    useEffect(() => {
        if (!user) return

        const fetchConversations = async () => {
            setLoading(true)

            // 1. Get bot IDs to filter by
            let botIds = []
            if (selectedBotId === 'all') {
                const { data: myBots } = await supabase
                    .from('chatbots')
                    .select('id')
                    .eq('user_id', user.id)
                botIds = myBots?.map(b => b.id) || []
            } else {
                botIds = [selectedBotId]
            }

            if (!botIds.length) {
                setConversations([])
                setLoading(false)
                return
            }

            // 2. Fetch conversations for those bots
            const { data, error } = await supabase
                .from('conversations')
                .select(`id, created_at, visitor_id, chatbot_id, chatbots ( name, color ), messages!inner(page_url)`)
                .eq('messages.role', 'user') // Join with user messages to get page_url
                .in('chatbot_id', botIds)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('[Conversations] Fetch error:', error)
            }

            setConversations(data || [])
            setLoading(false)
        }

        fetchConversations()
    }, [user, selectedBotId])

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.heading}>Conversations</h1>
                    <p className={styles.subheading}>Suivez les échanges avec vos visiteurs</p>
                </div>

                <div className={styles.filters}>
                    <CustomSelect
                        options={[
                            { value: 'all', label: 'Tous les Chatbots' },
                            ...chatbots.map(bot => ({ value: bot.id, label: bot.name }))
                        ]}
                        value={selectedBotId}
                        onChange={(val) => setSelectedBotId(val)}
                    />
                </div>
            </div>

            {/* List */}
            <div className={styles.list}>
                {loading ? (
                    <div className={styles.loading}>Chargement...</div>
                ) : (
                    <>
                        {conversations.map(conv => {
                            const color = conv.chatbots?.color || '#673DE6'
                            const initial = conv.chatbots?.name?.charAt(0).toUpperCase() || 'V'
                            const visitorLabel = conv.visitor_id ? `Visiteur #${conv.visitor_id.substring(0, 6)}` : 'Visiteur Anonyme'

                            // Get unique URLs from messages
                            const urls = conv.messages ? [...new Set(conv.messages.map(m => m.page_url).filter(Boolean))] : []
                            const sourceUrl = urls[0] || 'Direct / Inconnu'

                            return (
                                <Link key={conv.id} href={`/conversations/${conv.id}`} className={styles.item}>
                                    {/* Avatar */}
                                    <div className={styles.icon} style={{
                                        background: `linear-gradient(135deg, ${color} 0%, ${color}aa 100%)`,
                                        boxShadow: `0 8px 16px ${color}22`
                                    }}>
                                        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 20, color: 'white' }}>{initial}</span>
                                    </div>

                                    {/* Info */}
                                    <div className={styles.info}>
                                        <div className={styles.topRow}>
                                            <span className={styles.botName}>{conv.chatbots?.name}</span>
                                            <span className={styles.badge}>Actif</span>
                                        </div>
                                        <span className={styles.visitorInfo}>Discussion avec {visitorLabel}</span>
                                        {sourceUrl && (
                                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <span style={{ opacity: 0.6 }}>Page:</span>
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{sourceUrl}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Date + arrow */}
                                    <div className={styles.meta}>
                                        <span className={styles.date}>{formatDate(conv.created_at)}</span>
                                        <ChevronRight size={16} className={styles.arrow} />
                                    </div>
                                </Link>
                            )
                        })}

                        {conversations.length === 0 && (
                            <div className={styles.empty}>
                                <MessageSquare size={48} className={styles.emptyIcon} />
                                <h3 className={styles.emptyTitle}>Aucune conversation</h3>
                                <p className={styles.emptyText}>Les échanges avec vos chatbots apparaîtront ici.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
