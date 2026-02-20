'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function DemoChat() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Bonjour ! 👋 Je suis l\'assistant virtuel de démo. Comment puis-je vous aider à augmenter vos ventes ?' }
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isOpen])

    const handleSend = async (e) => {
        e.preventDefault()
        if (!input.trim()) return

        const userMsg = input
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMsg }])
        setIsTyping(true)

        // Simulate AI delay
        setTimeout(() => {
            const responses = [
                "C'est une excellente question ! Avec Vendo, vous pouvez automatiser ce type de réponse en quelques secondes.",
                "Je peux répondre à vos clients 24/7, même quand vous dormez. Pratique, non ?",
                "En intégrant ce chatbot, vous pourriez réduire votre support client de 70%.",
                "Voulez-vous savoir comment je m'intègre à Shopify ou WordPress ?",
                "C'est exactement ce pour quoi j'ai été conçu : engager vos visiteurs et booster vos conversions."
            ]
            const randomResponse = responses[Math.floor(Math.random() * responses.length)]

            setMessages(prev => [...prev, { role: 'assistant', content: randomResponse }])
            setIsTyping(false)
        }, 1500)
    }

    return (
        <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 50, fontFamily: 'inherit' }}>

            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: '#673DE6',
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(103, 61, 230, 0.4)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <MessageCircle size={32} />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    bottom: 80,
                    right: 0,
                    width: 380,
                    maxWidth: '90vw',
                    height: 500,
                    maxHeight: '70vh',
                    background: 'white',
                    borderRadius: 16,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0',
                    animation: 'fadeIn 0.3s ease-out'
                }}>
                    {/* Header */}
                    <div style={{ background: '#673DE6', color: 'white', padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ background: 'white', padding: 8, borderRadius: '50%', color: '#673DE6' }}>
                                <Bot size={20} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 16 }}>Assistant Démo</div>
                                <div style={{ fontSize: 12, opacity: 0.9, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }}></span>
                                    En ligne
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div style={{ flex: 1, padding: 16, overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                <div style={{
                                    maxWidth: '80%',
                                    padding: '12px 16px',
                                    borderRadius: 12,
                                    fontSize: 14,
                                    lineHeight: '1.5',
                                    color: msg.role === 'user' ? 'white' : '#1e293b',
                                    background: msg.role === 'user' ? '#673DE6' : 'white',
                                    boxShadow: msg.role === 'user' ? '0 2px 4px rgba(103, 61, 230, 0.2)' : '0 2px 4px rgba(0,0,0,0.05)',
                                    borderTopRightRadius: msg.role === 'user' ? 2 : 12,
                                    borderTopLeftRadius: msg.role === 'assistant' ? 2 : 12
                                }}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <div style={{ background: 'white', padding: '12px 16px', borderRadius: 12, borderRadiusTopLeft: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <div style={{ width: 6, height: 6, background: '#cbd5e1', borderRadius: '50%', animation: 'bounce 1s infinite 0ms' }}></div>
                                        <div style={{ width: 6, height: 6, background: '#cbd5e1', borderRadius: '50%', animation: 'bounce 1s infinite 200ms' }}></div>
                                        <div style={{ width: 6, height: 6, background: '#cbd5e1', borderRadius: '50%', animation: 'bounce 1s infinite 400ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} style={{ padding: 16, background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 8 }}>
                        <Input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Posez une question..."
                            style={{ borderRadius: 20 }}
                        />
                        <Button type="submit" size="icon" style={{ borderRadius: '50%', flexShrink: 0 }}>
                            <Send size={18} />
                        </Button>
                    </form>

                    {/* Branding */}
                    <div style={{ background: '#f1f5f9', padding: '6px 0', textAlign: 'center', fontSize: 10, color: '#334155' }}>
                        Propulsé par <span style={{ fontWeight: 600 }}>Vendo</span>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}
