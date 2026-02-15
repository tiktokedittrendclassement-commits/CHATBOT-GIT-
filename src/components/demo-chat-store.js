'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot } from 'lucide-react'

export default function DemoChatStore({ context }) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Bonjour ! Bienvenue chez LUMINA. Je suis votre assistant personnel. Comment puis-je vous aider à trouver votre style aujourd\'hui ? ✨' }
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)

    // UseRef for the container to control scroll directly
    const messagesContainerRef = useRef(null)

    // Scroll to bottom helper
    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            const { scrollHeight, clientHeight } = messagesContainerRef.current
            messagesContainerRef.current.scrollTop = scrollHeight - clientHeight
        }
    }

    // Auto-open logic when viewing product
    useEffect(() => {
        if (context) {
            setIsOpen(true)
            // Contextual proactive message
            let proactiveMsg = ""
            if (context.category === "Chaussures") {
                proactiveMsg = `Excellent choix ! Les ${context.name} sont notre best-seller. Elles taillent normalement. Besoin d'aide ? 👟`
            } else if (context.category === "Accessoires") {
                proactiveMsg = `Cette montre est magnifique. Saviez-vous qu'elle est livrée avec une extension de garantie offerte ? ⌚`
            } else {
                proactiveMsg = `Vous regardez le ${context.name}. C'est une pièce très demandée !`
            }
            setMessages(prev => [...prev, { role: 'assistant', content: proactiveMsg }])
        }
    }, [context])

    // Effect to scroll on messages change or typing
    useEffect(() => {
        // Immediate scroll
        scrollToBottom()
        // Delayed scroll for safe measure (images, rendering)
        const timeout = setTimeout(scrollToBottom, 50)
        return () => clearTimeout(timeout)
    }, [messages.length, isOpen, isTyping])

    const handleSend = async (e) => {
        e.preventDefault()
        if (!input.trim()) return

        const userMsgContent = input
        setInput('')

        // Prevent focus jump by NOT forcing focus elsewhere, but keeping input focused is default behavior usually.
        // If the user meant "page scrolls up", it might be due to focus logic. 
        // We do nothing specific here, focusing input is standard.

        const newMessages = [...messages, { role: 'user', content: userMsgContent }]
        setMessages(newMessages)
        setIsTyping(true)

        try {
            // Prepare messages for API
            let apiMessages = [...newMessages]

            if (context) {
                apiMessages = [
                    {
                        role: 'system',
                        content: `CONTEXT: User is currently viewing product: "${context.name}". Price: ${context.price}. Description: ${context.description}. Category: ${context.category}. Stock status: ${context.stock ? 'In Stock' : 'Out of Stock'}. Use this info to answer.`
                    },
                    ...apiMessages
                ]
            }

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: apiMessages,
                    chatbotId: 'DEMO', // Special ID for landing page demo
                    visitorId: 'demo-visitor-' + Math.random().toString(36).substr(2, 9)
                })
            })

            const data = await response.json()

            if (data.content) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.content }])
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: "Désolé, j'ai eu un petit problème technique." }])
            }
        } catch (error) {
            console.error(error)
            setMessages(prev => [...prev, { role: 'assistant', content: "Oups, je n'arrive pas à joindre le serveur." }])
        } finally {
            setIsTyping(false)
        }
    }

    return (
        <div style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* Toggle Button */}
            {!isOpen && (
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setIsOpen(true)}
                        style={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            background: '#6366F1',
                            color: 'white',
                            border: 'none',
                            boxShadow: '0 20px 40px rgba(99, 102, 241, 0.4)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) translateY(0)'}
                    >
                        <MessageCircle size={32} />
                    </button>
                    <div style={{ position: 'absolute', top: -2, right: -2, width: 16, height: 16, background: '#22C55E', borderRadius: '50%', border: '3px solid white' }}></div>
                </div>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    width: 360,
                    height: 500,
                    background: 'white',
                    borderRadius: 16,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0',
                    animation: 'slideUp 0.3s cubic-bezier(0.2, 1, 0.3, 1)',
                    transformOrigin: 'bottom right'
                }}>
                    {/* Header */}
                    <div style={{ background: '#0F172A', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{ background: '#6366F1', padding: 8, borderRadius: 12, color: 'white' }}>
                                    <Bot size={22} />
                                </div>
                                <div style={{ position: 'absolute', bottom: -4, right: -4, width: 12, height: 12, background: '#22C55E', borderRadius: '50%', border: '2px solid #0F172A' }}></div>
                            </div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: 16, color: 'white', letterSpacing: '-0.3px' }}>VENDO AI</div>
                                <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>Support Client Ultra-Rapide</div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', padding: 8, borderRadius: 10, transition: 'all 0.2s' }}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area - NOW USING REF HERE */}
                    <div
                        ref={messagesContainerRef}
                        style={{ flex: 1, padding: 20, overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 16 }}
                    >
                        <div style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', margin: '8px 0' }}>Aujourd'hui 10:23</div>

                        {messages.map((msg, idx) => (
                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                <div style={{ display: 'flex', gap: 8, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', maxWidth: '85%' }}>
                                    {msg.role === 'assistant' && msg.content && (
                                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#673DE6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0, marginTop: 4 }}>
                                            <Bot size={14} />
                                        </div>
                                    )}
                                    {msg.content && (
                                        <div style={{
                                            padding: '12px 16px',
                                            borderRadius: 12,
                                            fontSize: 14,
                                            lineHeight: '1.5',
                                            color: msg.role === 'user' ? 'white' : '#1e293b',
                                            background: msg.role === 'user' ? '#673DE6' : 'white',
                                            boxShadow: msg.role === 'user' ? '0 4px 6px -1px rgba(103, 61, 230, 0.3)' : '0 2px 4px rgba(0,0,0,0.05)',
                                            borderTopRightRadius: msg.role === 'user' ? 4 : 12,
                                            borderTopLeftRadius: msg.role === 'assistant' ? 4 : 12,
                                            whiteSpace: 'pre-wrap'
                                        }}>
                                            {msg.content}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div style={{ display: 'flex', gap: 8 }}>
                                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#673DE6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                                    <Bot size={14} />
                                </div>
                                <div style={{ background: 'white', padding: '12px 16px', borderRadius: 12, borderTopLeftRadius: 4, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <div style={{ width: 5, height: 5, background: '#cbd5e1', borderRadius: '50%', animation: 'bounce 1s infinite 0ms' }}></div>
                                        <div style={{ width: 5, height: 5, background: '#cbd5e1', borderRadius: '50%', animation: 'bounce 1s infinite 200ms' }}></div>
                                        <div style={{ width: 5, height: 5, background: '#cbd5e1', borderRadius: '50%', animation: 'bounce 1s infinite 400ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* No more messagesEndRef needed, we scroll the container */}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} style={{ padding: 20, background: 'white', borderTop: '1px solid #F1F5F9', display: 'flex', gap: 12 }}>
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Posez votre question..."
                            style={{
                                flex: 1,
                                border: '1px solid #E2E8F0',
                                borderRadius: 16,
                                padding: '12px 18px',
                                fontSize: 15,
                                outline: 'none',
                                background: '#F8FAFC',
                                color: '#0F172A',
                                fontWeight: 500,
                                transition: 'all 0.2s'
                            }}
                        />
                        <button type="submit" style={{ background: '#6366F1', color: 'white', width: 48, height: 48, borderRadius: 16, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)', transition: 'all 0.2s' }}>
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            )
            }

            <style jsx global>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
            `}</style>
        </div >
    )
}
