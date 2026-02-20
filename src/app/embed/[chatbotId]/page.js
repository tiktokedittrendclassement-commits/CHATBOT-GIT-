
'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Send, X, Bot } from 'lucide-react'
import { useParams } from 'next/navigation'

export default function EmbedPage() {
    const params = useParams()
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [botConfig, setBotConfig] = useState(null)
    const [error, setError] = useState(null)
    const messagesEndRef = useRef(null)
    const messagesContainerRef = useRef(null)

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
        }
    }

    useEffect(() => {
        const fetchBot = async () => {
            const { data, error } = await supabase
                .from('chatbots')
                .select('name, color, welcome_message_new, welcome_message_returning, triggers')
                .eq('id', params.chatbotId)
                .single()

            if (error) {
                setError('Chatbot introuvable')
            } else {
                setBotConfig(data)

                // Send bot config to parent window to update the bubble button
                if (typeof window !== 'undefined') {
                    window.parent.postMessage({
                        type: 'vendo-bot-config',
                        name: data.name,
                        color: data.color
                    }, '*')
                }

                const isReturning = typeof window !== 'undefined' && localStorage.getItem(`vendo_returning_${params.chatbotId}`)
                let greeting = data.welcome_message_new

                if (isReturning && data.welcome_message_returning) {
                    greeting = data.welcome_message_returning
                }

                // Send triggers to parent
                if (typeof window !== 'undefined') {
                    window.parent.postMessage({
                        type: 'vendo-init-triggers',
                        chatbotId: params.chatbotId,
                        triggers: data.triggers || []
                    }, '*')
                }

                if (greeting && greeting.trim().length > 0) {
                    setMessages([{ role: 'assistant', content: greeting }])

                    setTimeout(() => {
                        window.parent.postMessage({
                            type: 'vendo-proactive-message',
                            chatbotId: params.chatbotId,
                            message: greeting,
                            sender: data.name || 'Assistant',
                        }, '*')
                    }, 2000)
                }
            }
        }
        fetchBot()
    }, [params.chatbotId])

    useEffect(() => {
        scrollToBottom()
        const t = setTimeout(scrollToBottom, 50)
        return () => clearTimeout(t)
    }, [messages, loading])

    const handleSend = async (e) => {
        e.preventDefault()
        if (!input.trim() || loading) return

        const userMessage = { role: 'user', content: input }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setLoading(true)

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    chatbotId: params.chatbotId,
                })
            })

            const data = await response.json()
            if (data.error) throw new Error(data.error)
            setMessages(prev => [...prev, { role: 'assistant', content: data.content }])
        } catch (err) {
            if (err.name === 'AbortError') return
            setMessages(prev => [...prev, { role: 'assistant', content: 'Désolé, une erreur est survenue.' }])
        } finally {
            setLoading(false)
        }
    }

    if (error) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif', color: '#64748B' }}>
            {error}
        </div>
    )

    if (!botConfig) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif', color: '#94A3B8' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: 32, height: 32, border: '3px solid #E2E8F0', borderTop: `3px solid ${botConfig?.color || '#673DE6'}`, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }}></div>
                Chargement...
            </div>
        </div>
    )

    const brandColor = botConfig.color || '#673DE6'
    const brandInitial = botConfig.name?.charAt(0).toUpperCase() || 'A'
    const quickActions = botConfig.quick_actions || []

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            fontFamily: "'Inter', -apple-system, sans-serif",
            background: '#FFFFFF',
            overflow: 'hidden'
        }}>
            <style>{`
                * { box-sizing: border-box; margin: 0; padding: 0; }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes embedBounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                @keyframes embedPulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 4px; }
                input:focus { outline: none; }
            `}</style>

            {/* Header */}
            <div style={{
                background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}cc 100%)`,
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                position: 'relative',
                overflow: 'hidden',
                flexShrink: 0
            }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
                <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    flexShrink: 0
                }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 22, color: 'white' }}>{brandInitial}</span>
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 17, color: '#fff', letterSpacing: '-0.3px' }}>{botConfig.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <div style={{ width: 6, height: 6, background: '#10B981', borderRadius: '50%', boxShadow: '0 0 8px #10B981', animation: 'embedPulse 2s infinite' }}></div>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Assistant Expert Connecté</span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={messagesContainerRef}
                style={{
                    flex: 1,
                    padding: '20px',
                    overflowY: 'auto',
                    background: '#F8FAFC',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16
                }}
            >
                {messages.map((msg, i) => (
                    <div key={i} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
                    }}>
                        <div style={{
                            maxWidth: '85%',
                            padding: '12px 16px',
                            borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            fontSize: 14,
                            lineHeight: '1.6',
                            color: msg.role === 'user' ? '#fff' : '#1E293B',
                            background: msg.role === 'user' ? brandColor : '#FFFFFF',
                            boxShadow: msg.role === 'user'
                                ? `0 6px 14px ${brandColor}33`
                                : '0 2px 6px rgba(0,0,0,0.04)',
                            border: msg.role === 'assistant' ? '1px solid rgba(0,0,0,0.04)' : 'none',
                            fontWeight: 500,
                            whiteSpace: 'pre-wrap'
                        }}>
                            {msg.content}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div style={{ display: 'flex', gap: 5, paddingLeft: 4 }}>
                        <div style={{ width: 7, height: 7, background: '#CBD5E1', borderRadius: '50%', animation: 'embedBounce 1.4s infinite 0ms' }}></div>
                        <div style={{ width: 7, height: 7, background: '#CBD5E1', borderRadius: '50%', animation: 'embedBounce 1.4s infinite 200ms' }}></div>
                        <div style={{ width: 7, height: 7, background: '#CBD5E1', borderRadius: '50%', animation: 'embedBounce 1.4s infinite 400ms' }}></div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {quickActions.length > 0 && (
                <div style={{ padding: '0 20px 10px', background: '#F8FAFC', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', flexShrink: 0 }}>
                    {quickActions.map(label => (
                        <button key={label} onClick={() => setInput(label)} style={{
                            flexShrink: 0,
                            padding: '7px 12px',
                            background: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            borderRadius: '10px',
                            fontSize: 12,
                            fontWeight: 700,
                            color: '#334155',
                            cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif',
                            transition: 'all 0.2s'
                        }}>
                            {label}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <form onSubmit={handleSend} style={{
                padding: '16px 20px 20px',
                background: '#FFFFFF',
                borderTop: '1px solid #F1F5F9',
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                flexShrink: 0
            }}>
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Écrivez votre message..."
                    disabled={loading}
                    style={{
                        flex: 1,
                        border: '1.5px solid #F1F5F9',
                        borderRadius: '14px',
                        padding: '12px 16px',
                        fontSize: 14,
                        background: '#F8FAFC',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        color: '#1E293B',
                        transition: 'all 0.3s'
                    }}
                    onFocus={e => {
                        e.target.style.border = `1.5px solid ${brandColor}`
                        e.target.style.background = '#FFFFFF'
                        e.target.style.boxShadow = `0 0 0 3px ${brandColor}22`
                    }}
                    onBlur={e => {
                        e.target.style.border = '1.5px solid #F1F5F9'
                        e.target.style.background = '#F8FAFC'
                        e.target.style.boxShadow = 'none'
                    }}
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    style={{
                        background: brandColor,
                        color: '#fff',
                        width: 44,
                        height: 44,
                        borderRadius: '12px',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: input.trim() ? 'pointer' : 'not-allowed',
                        opacity: input.trim() ? 1 : 0.5,
                        transition: 'all 0.3s',
                        flexShrink: 0,
                        boxShadow: `0 6px 14px ${brandColor}44`
                    }}
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    )
}
