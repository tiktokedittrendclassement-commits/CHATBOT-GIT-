
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider' // Assumed existing hook
import styles from './page.module.css'
import Link from 'next/link'
import { MessageSquare, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function ConversationsPage() {
    const { user } = useAuth()
    const [conversations, setConversations] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        const fetchConversations = async () => {
            // Get IDs of my chatbots
            const { data: myBots } = await supabase
                .from('chatbots')
                .select('id, name')
                .eq('user_id', user.id)

            if (!myBots?.length) {
                setLoading(false)
                return
            }

            const botIds = myBots.map(b => b.id)

            // Fetch conversations for these bots
            const { data } = await supabase
                .from('conversations')
                .select(`
          id, 
          created_at, 
          visitor_id,
          chatbots ( name )
        `)
                .in('chatbot_id', botIds)
                .order('created_at', { ascending: false })

            setConversations(data || [])
            setLoading(false)
        }

        fetchConversations()
    }, [user])

    if (loading) return <div className={styles.loading}>Chargement des conversations...</div>

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.heading}>Conversations</h1>
                    <p className={styles.subheading}>Suivez les échanges avec vos visiteurs</p>
                </div>
            </div>

            <div className={styles.list}>
                {conversations.map(conv => (
                    <Link key={conv.id} href={`/conversations/${conv.id}`} className={styles.item}>
                        <div className={styles.icon}>
                            <MessageSquare size={20} />
                        </div>
                        <div className={styles.info}>
                            <div className={styles.meta}>
                                <span className={styles.botName}>{conv.chatbots?.name}</span>
                                <div className={styles.badges}>
                                    {/* Fake 'New' badge for demo, logic can be added later */}
                                    <span className={`${styles.badge} ${styles.badgeNew}`}>Actif</span>
                                    <span className={styles.date}>
                                        <Calendar size={12} />
                                        {formatDate(conv.created_at)}
                                    </span>
                                </div>
                            </div>
                            <div className={styles.messagePreview}>
                                Discussion avec {conv.visitor_id ? `Visiteur #${conv.visitor_id.substring(0, 6)}` : 'Visiteur Anonyme'}
                            </div>
                        </div>
                    </Link>
                ))}

                {conversations.length === 0 && (
                    <div className={styles.empty}>
                        <MessageSquare size={48} color="#cbd5e1" />
                        <h3>Aucune conversation</h3>
                        <p>Les échanges avec vos chatbots apparaîtront ici.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
