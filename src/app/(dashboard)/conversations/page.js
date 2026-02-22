'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import Link from 'next/link'
import { MessageSquare, ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import styles from './page.module.css'

export default function ConversationsPage() {
    const { user } = useAuth()
    const [conversations, setConversations] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        const fetchConversations = async () => {
            const { data: myBots } = await supabase
                .from('chatbots')
                .select('id, name, color')
                .eq('user_id', user.id)

            if (!myBots?.length) {
                setLoading(false)
                return
            }

            const botIds = myBots.map(b => b.id)

            const { data } = await supabase
                .from('conversations')
                .select(`id, created_at, visitor_id, chatbot_id, chatbots ( name, color )`)
                .in('chatbot_id', botIds)
                .order('created_at', { ascending: false })

            setConversations(data || [])
            setLoading(false)
        }

        fetchConversations()
    }, [user])

    if (loading) return (
        <div className={styles.loading}>
            Chargement des conversations...
        </div>
    )

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h1 className={styles.heading}>Conversations</h1>
                <p className={styles.subheading}>Suivez les échanges avec vos visiteurs</p>
            </div>

            {/* List */}
            <div className={styles.list}>
                {conversations.map(conv => {
                    const color = conv.chatbots?.color || '#673DE6'
                    const initial = conv.chatbots?.name?.charAt(0).toUpperCase() || 'V'
                    const visitorLabel = conv.visitor_id ? `Visiteur #${conv.visitor_id.substring(0, 6)}` : 'Visiteur Anonyme'

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
            </div>
        </div>
    )
}
