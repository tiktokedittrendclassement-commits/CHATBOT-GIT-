
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
        <div>
            <h1 className={styles.heading}>Conversations</h1>

            <div className={styles.list}>
                {conversations.map(conv => (
                    <Link key={conv.id} href={`/conversations/${conv.id}`} className={styles.item}>
                        <div className={styles.icon}>
                            <MessageSquare size={24} />
                        </div>
                        <div className={styles.info}>
                            <div className={styles.meta}>
                                <span className={styles.botName}>{conv.chatbots?.name}</span>
                                <span className={styles.date}>{formatDate(conv.created_at)}</span>
                            </div>
                            <div className={styles.visitor}>Visiteur: {conv.visitor_id || 'Anonyme'}</div>
                        </div>
                    </Link>
                ))}
                {conversations.length === 0 && (
                    <div className={styles.empty}>Aucune conversation trouvée.</div>
                )}
            </div>
        </div>
    )
}
