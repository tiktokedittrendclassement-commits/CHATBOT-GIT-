
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
                .select('name, color, logo_url, welcome_message_new, welcome_message_returning, triggers, theme, subtitle')
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
                        color: data.color,
                        avatar: data.logo_url
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

    const handleClose = () => {
        if (typeof window !== 'undefined') {
            window.parent.postMessage({ type: 'vendo-toggle-chat' }, '*')
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

    const isDark = botConfig.theme === 'dark'
    const brandColor = botConfig.color || '#673DE6'
    const brandInitial = botConfig.name?.charAt(0).toUpperCase() || 'A'
    const quickActions = botConfig.quick_actions || []

    const themeColors = {
        bgMain: isDark ? '#0F172A' : '#FFFFFF',
        bgMessages: isDark ? '#020617' : '#F8FAFC',
        textMain: isDark ? '#F8FAFC' : '#1E293B',
        textMuted: isDark ? 'rgba(255, 255, 255, 0.5)' : '#64748B',
        bubbleAssistant: isDark ? '#1E293B' : '#FFFFFF',
        bubbleTextAssistant: isDark ? '#F8FAFC' : '#1E293B',
        inputBg: isDark ? '#1E293B' : '#F8FAFC',
        inputBorder: isDark ? '#334155' : '#F1F5F9',
        scrollbar: isDark ? '#334155' : '#E2E8F0'
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            fontFamily: "'Inter', -apple-system, sans-serif",
            background: themeColors.bgMain,
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
                ::-webkit-scrollbar-thumb { background: ${themeColors.scrollbar}; border-radius: 4px; }
                input:focus { outline: none; }
            `}</style>

            {/* Header */}
            <div style={{
                background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}cc 100%)`,
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                position: 'relative',
                overflow: 'hidden',
                flexShrink: 0
            }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
                <div style={{
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.2)',
                    flexShrink: 0,
                    boxShadow: 'none'
                }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 22, color: 'white', textShadow: 'none' }}>{brandInitial}</span>
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: '-0.4px' }}>{botConfig.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <div style={{ width: 6, height: 6, background: '#10B981', borderRadius: '50%', boxShadow: '0 0 8px #10B981', animation: 'embedPulse 2s infinite' }}></div>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                            {botConfig.subtitle || 'Assistant Expert Connecté'}
                        </span>
                    </div>
                </div>

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        zIndex: 10
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                    <X size={16} />
                </button>
            </div>

            {/* Messages */}
            <div
                ref={messagesContainerRef}
                style={{
                    flex: 1,
                    padding: '24px',
                    overflowY: 'auto',
                    background: '#0B0E14',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 20,
                    scrollBehavior: 'smooth'
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
                            padding: '14px 18px',
                            borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                            fontSize: 14.5,
                            lineHeight: '1.6',
                            color: msg.role === 'user' ? '#fff' : '#F1F5F9',
                            background: msg.role === 'user' ? brandColor : '#1E293B',
                            boxShadow: msg.role === 'user'
                                ? `0 8px 16px ${brandColor}33`
                                : '0 2px 8px rgba(0,0,0,0.2)',
                            border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.05)' : 'none',
                            fontWeight: 500,
                            whiteSpace: 'pre-wrap'
                        }}>
                            {msg.content}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div style={{ display: 'flex', gap: 5, paddingLeft: 4 }}>
                        <div style={{ width: 7, height: 7, background: isDark ? '#334155' : '#CBD5E1', borderRadius: '50%', animation: 'embedBounce 1.4s infinite 0ms' }}></div>
                        <div style={{ width: 7, height: 7, background: isDark ? '#334155' : '#CBD5E1', borderRadius: '50%', animation: 'embedBounce 1.4s infinite 200ms' }}></div>
                        <div style={{ width: 7, height: 7, background: isDark ? '#334155' : '#CBD5E1', borderRadius: '50%', animation: 'embedBounce 1.4s infinite 400ms' }}></div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {quickActions.length > 0 && (
                <div style={{ padding: '0 20px 10px', background: themeColors.bgMessages, display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', flexShrink: 0 }}>
                    {quickActions.map(label => (
                        <button key={label} onClick={() => setInput(label)} style={{
                            flexShrink: 0,
                            padding: '7px 12px',
                            background: themeColors.bubbleAssistant,
                            border: `1px solid ${themeColors.inputBorder}`,
                            borderRadius: '10px',
                            fontSize: 12,
                            fontWeight: 700,
                            color: themeColors.textMain,
                            cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif',
                            transition: 'all 0.2s'
                        }}>
                            {label}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSend} style={{
                padding: '20px 24px 30px',
                background: '#0B0E14',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                flexShrink: 0
            }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={`Posez une question à ${botConfig.name || 'Assistant'}...`}
                        style={{
                            width: '100%',
                            border: '1.5px solid rgba(255,255,255,0.05)',
                            borderRadius: '16px',
                            padding: '14px 18px',
                            fontSize: 14,
                            background: '#1E293B',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            color: '#F1F5F9',
                            transition: 'all 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
                            outline: 'none'
                        }}
                        onFocus={e => {
                            e.currentTarget.style.border = `1.5px solid ${brandColor}`
                            e.currentTarget.style.background = '#1E293B'
                            e.currentTarget.style.boxShadow = `0 0 0 4px ${brandColor}26`
                        }}
                        onBlur={e => {
                            e.currentTarget.style.border = '1.5px solid rgba(255,255,255,0.05)'
                            e.currentTarget.style.background = '#1E293B'
                            e.currentTarget.style.boxShadow = 'none'
                        }}
                    />
                </div>
                <button
                    type="submit"
                    style={{
                        background: brandColor,
                        color: '#fff',
                        width: 48,
                        height: 48,
                        borderRadius: '14px',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        boxShadow: `0 8px 16px ${brandColor}4D`,
                        flexShrink: 0
                    }}
                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.9)'}
                    onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    )
}
