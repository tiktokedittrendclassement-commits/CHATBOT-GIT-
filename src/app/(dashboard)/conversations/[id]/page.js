
'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
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
    const messagesContainerRef = useRef(null)

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
        }
    }

    useEffect(() => {
        if (!user) return

        const fetchData = async () => {
            const { data: conv, error } = await supabase
                .from('conversations')
                .select(`id, created_at, visitor_id, chatbots ( name, color )`)
                .eq('id', params.id)
                .single()

            if (error) {
                setLoading(false)
                return
            }

            setConversation(conv)

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
        scrollToBottom()
    }, [messages])

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', fontFamily: 'Inter, sans-serif', color: '#94A3B8', fontSize: 15 }}>
            Chargement...
        </div>
    )

    if (!conversation) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', fontFamily: 'Inter, sans-serif', color: '#EF4444', fontSize: 15 }}>
            Conversation introuvable ou accès refusé.
        </div>
    )

    const brandColor = conversation.chatbots?.color || '#673DE6'
    const brandInitial = conversation.chatbots?.name?.charAt(0).toUpperCase() || 'A'
    const visitorLabel = conversation.visitor_id ? `Visiteur #${conversation.visitor_id.substring(0, 6)}` : 'Visiteur Anonyme'

    return (
        <div style={{ fontFamily: "'Inter', sans-serif", maxWidth: 780, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
            <style>{`
                @keyframes convBounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 4px; }
            `}</style>

            {/* Top bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexShrink: 0 }}>
                <Link href="/conversations" style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 14, fontWeight: 700, color: '#64748B',
                    textDecoration: 'none', padding: '8px 14px',
                    background: '#F8FAFC', border: '1px solid #E2E8F0',
                    borderRadius: 12, transition: 'all 0.2s'
                }}>
                    <ArrowLeft size={16} /> Retour
                </Link>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.4px', marginBottom: 2 }}>{conversation.chatbots?.name}</h1>
                    <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500 }}>{visitorLabel} • {formatDate(conversation.created_at)}</span>
                </div>
            </div>

            {/* Chat window */}
            <div style={{
                flex: 1,
                background: '#FFFFFF',
                borderRadius: 24,
                border: '1px solid #F1F5F9',
                boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{
                    background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}cc 100%)`,
                    padding: '18px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    flexShrink: 0
                }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        width: 42,
                        height: 42,
                        borderRadius: 13,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(255,255,255,0.3)',
                        flexShrink: 0
                    }}>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 20, color: 'white' }}>{brandInitial}</span>
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 16, color: '#fff', letterSpacing: '-0.3px' }}>{conversation.chatbots?.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                            <div style={{ width: 6, height: 6, background: '#10B981', borderRadius: '50%' }}></div>
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{messages.length} messages</span>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div
                    ref={messagesContainerRef}
                    style={{
                        flex: 1,
                        padding: '24px',
                        overflowY: 'auto',
                        background: '#F8FAFC',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 16
                    }}
                >
                    {messages.length === 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8', fontSize: 14, fontWeight: 500 }}>
                            Aucun message dans cette conversation.
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
                            }}>
                                {/* Role label */}
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px', paddingLeft: 4, paddingRight: 4 }}>
                                    {msg.role === 'user' ? visitorLabel : conversation.chatbots?.name}
                                </div>
                                <div style={{
                                    maxWidth: '80%',
                                    padding: '12px 16px',
                                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                    fontSize: 14,
                                    lineHeight: '1.6',
                                    color: msg.role === 'user' ? '#fff' : '#1E293B',
                                    background: msg.role === 'user' ? brandColor : '#FFFFFF',
                                    boxShadow: msg.role === 'user'
                                        ? `0 6px 14px ${brandColor}33`
                                        : '0 2px 8px rgba(0,0,0,0.04)',
                                    border: msg.role === 'assistant' ? '1px solid rgba(0,0,0,0.04)' : 'none',
                                    fontWeight: 500,
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {msg.content}
                                </div>
                                <div style={{ fontSize: 11, color: '#CBD5E1', marginTop: 4, paddingLeft: 4, paddingRight: 4 }}>
                                    {msg.created_at ? formatDate(msg.created_at) : ''}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
