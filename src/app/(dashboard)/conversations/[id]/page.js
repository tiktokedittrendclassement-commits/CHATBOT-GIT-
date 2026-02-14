
'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import styles from './page.module.css'
import { ArrowLeft, User, Bot } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { formatDate } from '@/lib/utils'

export default function ConversationDetailPage() {
    const params = useParams()
    const { user } = useAuth()
    const [messages, setMessages] = useState([])
    const [conversation, setConversation] = useState(null)
    const [loading, setLoading] = useState(true)
    const bottomRef = useRef(null)

    useEffect(() => {
        if (!user) return

        const fetchData = async () => {
            // 1. Fetch Conversation Details (and verify ownership via RLS)
            const { data: conv, error } = await supabase
                .from('conversations')
                .select(`
          id, 
          created_at, 
          visitor_id,
          chatbots ( name, color )
        `)
                .eq('id', params.id)
                .single()

            if (error) {
                console.error(error)
                setLoading(false)
                return
            }

            setConversation(conv)

            // 2. Fetch Messages
            const { data: msgs } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', params.id)
                .order('created_at', { ascending: true })

            setMessages(msgs || [])
            setLoading(false)
        }

        fetchData()
    }, [user, params.id])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    if (loading) return <div className={styles.loading}>Chargement de la conversation...</div>
    if (!conversation) return <div className={styles.error}>Conversation introuvable ou accès refusé.</div>

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href="/conversations" className={styles.backLink}>
                    <ArrowLeft size={20} />
                    Retour
                </Link>
                <div className={styles.headerInfo}>
                    <h1 className={styles.title}>{conversation.chatbots?.name}</h1>
                    <span className={styles.subtitle}>
                        Visiteur: {conversation.visitor_id || 'Anonyme'} • {formatDate(conversation.created_at)}
                    </span>
                </div>
            </div>

            <div className={styles.chatWindow}>
                {messages.length === 0 ? (
                    <div className={styles.empty}>Aucun message dans cette conversation.</div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`${styles.messageRow} ${msg.role === 'user' ? styles.userRow : styles.botRow}`}
                        >
                            <div className={styles.avatar}>
                                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                            </div>
                            <div className={styles.bubble}>
                                {msg.content}
                            </div>
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    )
}
