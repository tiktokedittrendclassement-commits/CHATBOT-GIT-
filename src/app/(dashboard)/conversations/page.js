
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import Link from 'next/link'
import { MessageSquare, Calendar, ChevronRight, Bot } from 'lucide-react'
import { formatDate } from '@/lib/utils'

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
            const botMap = Object.fromEntries(myBots.map(b => [b.id, b]))

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', fontFamily: 'Inter, sans-serif', color: '#94A3B8', fontSize: 15 }}>
            Chargement des conversations...
        </div>
    )

    return (
        <div style={{ fontFamily: "'Inter', sans-serif", maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
            <style>{`
                .conv-item:hover { background: #F8FAFC !important; transform: translateX(4px); }
                .conv-item { transition: all 0.2s ease; }
            `}</style>

            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.6px', marginBottom: 6 }}>Conversations</h1>
                <p style={{ fontSize: 15, color: '#64748B', fontWeight: 500 }}>Suivez les échanges avec vos visiteurs</p>
            </div>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {conversations.map(conv => {
                    const color = conv.chatbots?.color || '#673DE6'
                    const initial = conv.chatbots?.name?.charAt(0).toUpperCase() || 'A'
                    const visitorLabel = conv.visitor_id ? `Visiteur #${conv.visitor_id.substring(0, 6)}` : 'Visiteur Anonyme'

                    return (
                        <Link key={conv.id} href={`/conversations/${conv.id}`} style={{ textDecoration: 'none' }}>
                            <div className="conv-item" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 16,
                                background: '#FFFFFF',
                                border: '1px solid #F1F5F9',
                                borderRadius: 18,
                                padding: '16px 20px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                cursor: 'pointer'
                            }}>
                                {/* Avatar */}
                                <div style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 14,
                                    background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    boxShadow: `0 6px 14px ${color}33`
                                }}>
                                    <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 22, color: 'white' }}>{initial}</span>
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                                        <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{conv.chatbots?.name}</span>
                                        <span style={{
                                            fontSize: 11,
                                            fontWeight: 700,
                                            background: '#DCFCE7',
                                            color: '#16A34A',
                                            padding: '2px 8px',
                                            borderRadius: 20,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>Actif</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>Discussion avec {visitorLabel}</span>
                                    </div>
                                </div>

                                {/* Date + arrow */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                                    <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>{formatDate(conv.created_at)}</span>
                                    <ChevronRight size={16} color="#CBD5E1" />
                                </div>
                            </div>
                        </Link>
                    )
                })}

                {conversations.length === 0 && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '80px 24px',
                        background: '#F8FAFC',
                        borderRadius: 24,
                        border: '1px dashed #E2E8F0',
                        gap: 16
                    }}>
                        <div style={{ width: 64, height: 64, background: '#F1F5F9', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MessageSquare size={28} color="#CBD5E1" />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Aucune conversation</h3>
                            <p style={{ fontSize: 14, color: '#94A3B8', fontWeight: 500 }}>Les échanges avec vos chatbots apparaîtront ici.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
