
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', fontFamily: 'Inter, sans-serif', color: 'rgba(255, 255, 255, 0.4)', fontSize: 15 }}>
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
        <div className="conversation-detail-container" style={{ fontFamily: "'Inter', sans-serif", maxWidth: 780, margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
            <style jsx>{`
                .conversation-detail-container {
                    padding: 32px 24px;
                }
                .chat-window {
                    flex: 1;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 28px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                .message-bubble {
                    max-width: 80%;
                    padding: 12px 16px;
                    font-size: 14px;
                    line-height: 1.6;
                    font-weight: 500;
                    white-space: pre-wrap;
                }
                @media (max-width: 768px) {
                    .conversation-detail-container {
                        padding: 16px 12px;
                        height: calc(100vh - 64px);
                    }
                    .chat-window {
                        border-radius: 20px;
                    }
                    .message-bubble {
                        max-width: 90%;
                        font-size: 13px;
                        padding: 10px 14px;
                    }
                    .top-bar-title {
                        font-size: 16px !important;
                    }
                    .header-status {
                        padding: 14px 18px !important;
                    }
                }
                
                @keyframes convBounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 4px; }
            `}</style>

            {/* Top bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexShrink: 0 }}>
                <Link href="/conversations" style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 13, fontWeight: 700, color: 'rgba(255, 255, 255, 0.4)',
                    textDecoration: 'none', padding: '8px 16px',
                    background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 12, transition: 'all 0.2s'
                }}>
                    <ArrowLeft size={16} /> <span className="back-text">Retour</span>
                </Link>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h1 className="top-bar-title" style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.4px', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conversation.chatbots?.name}</h1>
                    <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.4)', fontWeight: 500 }}>{visitorLabel}</span>
                </div>
            </div>

            {/* Chat window */}
            <div className="chat-window">
                {/* Header */}
                <div className="header-status" style={{
                    background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}cc 100%)`,
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    flexShrink: 0
                }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(255,255,255,0.3)',
                        flexShrink: 0
                    }}>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 16, color: 'white' }}>{brandInitial}</span>
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 15, color: '#fff', letterSpacing: '-0.3px' }}>En direct</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 1 }}>
                            <div style={{ width: 6, height: 6, background: '#10B981', borderRadius: '50%' }}></div>
                            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{messages.length} messages</span>
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
                        background: 'transparent',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 16
                    }}
                >
                    {messages.length === 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8', fontSize: 14, fontWeight: 500 }}>
                            Aucun message
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
                            }}>
                                <div className="message-bubble" style={{
                                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                    color: msg.role === 'user' ? '#fff' : 'rgba(255, 255, 255, 0.8)',
                                    background: msg.role === 'user' ? brandColor : 'rgba(255, 255, 255, 0.05)',
                                    boxShadow: msg.role === 'user'
                                        ? `0 10px 20px -5px ${brandColor}66`
                                        : 'none',
                                    border: msg.role === 'assistant' ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                                }}>
                                    {msg.content}
                                </div>
                                <div style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.2)', marginTop: 4, paddingLeft: 4, paddingRight: 4, fontWeight: 500 }}>
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
