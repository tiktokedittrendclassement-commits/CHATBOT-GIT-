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
                proactiveMsg = `Excellent choix ! Les ${context.name} sont notre best-seller du mois. Elles taillent normalement. Besoin d'aide pour la taille ? 👟`
            } else if (context.category === "Accessoires") {
                proactiveMsg = `Cette montre est magnifique. Saviez-vous qu'elle est livrée avec un écrin de protection offert ? ⌚`
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
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            background: '#0f172a',
                            color: 'white',
                            border: 'none',
                            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.4)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <MessageCircle size={30} />
                    </button>
                    <div style={{ position: 'absolute', top: -5, right: -5, width: 14, height: 14, background: '#22c55e', borderRadius: '50%', border: '2px solid white' }}></div>
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
                    <div style={{ background: '#0f172a', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{ background: 'white', padding: 8, borderRadius: '50%', color: '#0f172a' }}>
                                    <Bot size={20} />
                                </div>
                                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, background: '#22c55e', borderRadius: '50%', border: '2px solid #0f172a' }}></div>
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 15, color: 'white' }}>Mon Assistant Vendo</div>
                                <div style={{ fontSize: 11, color: '#94a3b8' }}>En ligne</div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', padding: 6, borderRadius: 6 }}>
                            <X size={18} />
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
                                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0, marginTop: 4 }}>
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
                                            background: msg.role === 'user' ? '#2563eb' : 'white',
                                            boxShadow: msg.role === 'user' ? '0 4px 6px -1px rgba(37, 99, 235, 0.3)' : '0 2px 4px rgba(0,0,0,0.05)',
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
                                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
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
                    <form onSubmit={handleSend} style={{ padding: 16, background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 10 }}>
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Écrivez votre message..."
                            style={{
                                flex: 1,
                                border: '1px solid #e2e8f0',
                                borderRadius: 24,
                                padding: '10px 16px',
                                fontSize: 14,
                                outline: 'none',
                                background: '#f8fafc',
                                color: '#0f172a'
                            }}
                        />
                        <button type="submit" style={{ background: '#2563eb', color: 'white', width: 40, height: 40, borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.4)' }}>
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}

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
        </div>
    )
}
