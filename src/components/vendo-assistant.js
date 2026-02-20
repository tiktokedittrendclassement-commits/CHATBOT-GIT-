'use client'

import { useState, useRef, useEffect, memo } from 'react'
import { MessageCircle, X, Send, Bot, Sparkles, HelpCircle } from 'lucide-react'
import { usePathname } from 'next/navigation'

const Typewriter = memo(({ text, speed = 8, onComplete }) => {
    const [displayedText, setDisplayedText] = useState('')
    const [index, setIndex] = useState(0)

    useEffect(() => {
        if (index < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + text[index])
                setIndex(prev => prev + 1)
            }, speed)
            return () => clearTimeout(timeout)
        } else if (onComplete) {
            onComplete()
        }
    }, [index, text, speed, onComplete])

    return <span>{displayedText}</span>
})

export default function VendoAssistant() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Bienvenue sur Vendo. ✨\n\nJe suis votre **Concierge IA**. Je peux vous présenter la puissance de notre plateforme ou **forger le System Prompt d'élite** pour votre futur chatbot.\n\nQuelle est votre mission aujourd'hui ?", shouldType: false }
    ])
    const [teaserText, setTeaserText] = useState(null)
    const messagesContainerRef = useRef(null)
    const [isTyping, setIsTyping] = useState(false)
    const [input, setInput] = useState('')

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: 'smooth'
            })
        }
    }

    const markAsTyped = (index) => {
        // Implementation for markAsTyped if needed
    }

    const handleSend = (e) => {
        e.preventDefault()
        if (!input.trim()) return

        const newMessages = [...messages, { role: 'user', content: input }]
        setMessages(newMessages)
        setInput('')
        setIsTyping(true)

        // Mock response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Je suis une démo pour l'instant. Configurez-moi dans l'onglet 'Chatbots' !",
                shouldType: true
            }])
            setIsTyping(false)
        }, 1000)
    }

    // Proactive Welcome Message & Event Listeners
    useEffect(() => {
        // Trigger welcome message after 1 second ONLY on the landing page
        if (pathname !== '/') return

        const timer = setTimeout(() => {
            if (!isOpen) {
                setTeaserText("Bonjour ! Je suis votre assistant IA. Je peux répondre à toutes vos questions sur Vendo. ✨")
            }
        }, 500)

        const handleProactiveTrigger = (e) => {
            if (e.detail?.message) {
                setTeaserText(e.detail.message)
                setIsOpen(false)
            }
        }

        window.addEventListener('vendo-proactive-trigger', handleProactiveTrigger)

        return () => {
            clearTimeout(timer)
            window.removeEventListener('vendo-proactive-trigger', handleProactiveTrigger)
        }
    }, [pathname])

    // Simple Auto-dismiss (3 seconds)
    useEffect(() => {
        if (isOpen || !teaserText) return

        const timer = setTimeout(() => {
            setTeaserText(null)
        }, 5000)

        return () => clearTimeout(timer)
    }, [isOpen, teaserText])

    if (!teaserText && !isOpen) return (
        <button
            onClick={() => setIsOpen(true)}
            className="vendo-toggle-btn"
            style={{
                position: 'fixed',
                bottom: 30, right: 30,
                width: 64,
                height: 64,
                borderRadius: '20px',
                background: '#673DE6',
                color: 'white',
                border: 'none',
                boxShadow: '0 20px 40px rgba(103, 61, 230, 0.3)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
        >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                    fontSize: 32,
                    fontWeight: 900,
                    letterSpacing: '-2px',
                    transform: 'skewX(-10deg)',
                    textShadow: '2px 2px 0px rgba(0,0,0,0.1)'
                }}>V</div>
                <div style={{ position: 'absolute', top: -10, right: -15, width: 14, height: 14, background: '#10B981', border: '3px solid #673DE6', borderRadius: '50%' }}></div>
            </div>
        </button>
    )

    return (
        <div style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 9999, fontFamily: "'Inter', sans-serif" }}>

            {/* Premium Invite Card for Vendo Assistant */}
            {!isOpen && (
                <div
                    onClick={() => setIsOpen(true)}
                    className="vendo-invite-card"
                    style={{
                        position: 'absolute',
                        bottom: 80,
                        right: 0,
                        width: 320,
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: 24,
                        boxShadow: '0 20px 50px rgba(103, 61, 230, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5)',
                        fontFamily: "inherit",
                        zIndex: 9998,
                        cursor: 'pointer',
                        transformOrigin: 'bottom right',
                        animation: 'slideInUpPremium 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards, float 4s ease-in-out infinite',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        padding: '4px'
                    }}
                >
                    <div style={{ padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                            <div style={{
                                width: 50,
                                height: 50,
                                background: 'linear-gradient(135deg, #673DE6 0%, #8B5CF6 100%)',
                                borderRadius: 16,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                boxShadow: '0 8px 16px rgba(103, 61, 230, 0.2)'
                            }}>
                                <Bot size={26} />
                            </div>
                            <div style={{ position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, background: '#10B981', border: '3px solid white', borderRadius: '50%' }}></div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: '#673DE6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Assistant Vendo</div>
                            <div style={{ fontSize: 14.5, color: '#020617', fontWeight: 600, lineHeight: 1.5 }}>{teaserText}</div>
                        </div>
                    </div>
                    <div style={{
                        margin: '0 4px 4px',
                        padding: '10px 16px',
                        background: 'rgba(103, 61, 230, 0.05)',
                        borderRadius: 18,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Maintenant</span>
                        <div style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: '#673DE6',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            background: 'white',
                            padding: '6px 12px',
                            borderRadius: 12,
                            boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                        }}>
                            Répondre <Send size={12} />
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="vendo-toggle-btn"
                    style={{
                        width: 64,
                        height: 64,
                        borderRadius: '20px',
                        background: '#673DE6',
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 20px 40px rgba(103, 61, 230, 0.3)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
                >
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{
                            fontSize: 32,
                            fontWeight: 900,
                            letterSpacing: '-2px',
                            transform: 'skewX(-10deg)',
                            textShadow: '2px 2px 0px rgba(0,0,0,0.1)'
                        }}>V</div>
                        <div style={{ position: 'absolute', top: -10, right: -15, width: 14, height: 14, background: '#10B981', border: '3px solid #673DE6', borderRadius: '50%' }}></div>
                    </div>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div
                    className="vendo-chat-window"
                    style={{
                        width: 400,
                        height: 600,
                        background: '#FFFFFF',
                        borderRadius: 28,
                        boxShadow: '0 30px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        animation: 'slideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        transformOrigin: 'bottom right'
                    }}>
                    {/* Header */}
                    <div style={{
                        background: '#673DE6',
                        padding: '24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 1 }}>
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
                                border: '1px solid rgba(255,255,255,0.2)'
                            }}>
                                <Bot size={22} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: '-0.4px' }}>Vendo Assistant</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div style={{ width: 6, height: 6, background: '#10B981', borderRadius: '50%', boxShadow: '0 0 10px #10B981' }}></div>
                                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Expert Vendo Connecté</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
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
                                zIndex: 2
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
                            background: '#F8FAFC',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 20,
                            scrollBehavior: 'smooth'
                        }}
                    >
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                <div style={{
                                    maxWidth: '85%',
                                    padding: '14px 18px',
                                    borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                    fontSize: 14.5,
                                    lineHeight: '1.6',
                                    color: msg.role === 'user' ? '#fff' : '#1E293B',
                                    background: msg.role === 'user' ? '#673DE6' : '#FFFFFF',
                                    boxShadow: msg.role === 'user' ? '0 8px 16px rgba(103, 61, 230, 0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
                                    border: msg.role === 'assistant' ? '1px solid rgba(0,0,0,0.03)' : 'none',
                                    whiteSpace: 'pre-wrap',
                                    fontWeight: 500
                                }}>
                                    {msg.role === 'assistant' && msg.shouldType ? (
                                        <Typewriter text={msg.content} onComplete={() => {
                                            markAsTyped(idx);
                                            scrollToBottom();
                                        }} />
                                    ) : (
                                        msg.content
                                    )}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div style={{ display: 'flex', gap: 6, paddingLeft: 8 }}>
                                <div style={{ width: 8, height: 8, background: '#CED4DA', borderRadius: '50%', animation: 'bounce 1.4s infinite 0ms' }}></div>
                                <div style={{ width: 8, height: 8, background: '#CED4DA', borderRadius: '50%', animation: 'bounce 1.4s infinite 200ms' }}></div>
                                <div style={{ width: 8, height: 8, background: '#CED4DA', borderRadius: '50%', animation: 'bounce 1.4s infinite 400ms' }}></div>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div style={{ padding: '0 24px 12px', background: '#F8FAFC', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
                        {['Tarifs', 'Aide Prompt', 'WhatsApp', 'Marque Blanche'].map(label => (
                            <button key={label} style={{
                                flexShrink: 0,
                                padding: '8px 14px',
                                background: '#FFFFFF',
                                border: '1px solid #E2E8F0',
                                borderRadius: '12px',
                                fontSize: 12,
                                fontWeight: 700,
                                color: '#334155',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                            }}
                                onClick={() => { setInput(label === 'Aide Prompt' ? "Aide moi à créer un prompt pour mon bot" : label); }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#673DE6'; e.currentTarget.style.color = '#673DE6'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#334155'; }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} style={{
                        padding: '20px 24px 30px',
                        background: '#FFFFFF',
                        borderTop: '1px solid #F1F5F9',
                        display: 'flex',
                        gap: 12,
                        alignItems: 'center'
                    }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Posez une question à Vendo..."
                                style={{
                                    width: '100%',
                                    border: '1.5px solid #F1F5F9',
                                    borderRadius: '16px',
                                    padding: '14px 18px',
                                    fontSize: 14,
                                    outline: 'none',
                                    background: '#F8FAFC',
                                    transition: 'all 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
                                    fontWeight: 500,
                                    color: '#1E293B'
                                }}
                                onFocus={e => {
                                    e.currentTarget.style.border = '1.5px solid #673DE6'
                                    e.currentTarget.style.background = '#FFFFFF'
                                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(103, 61, 230, 0.1)'
                                }}
                                onBlur={e => {
                                    e.currentTarget.style.border = '1.5px solid #F1F5F9'
                                    e.currentTarget.style.background = '#F8FAFC'
                                    e.currentTarget.style.boxShadow = 'none'
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            style={{
                                background: '#673DE6',
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
                                boxShadow: '0 8px 16px rgba(103, 61, 230, 0.2)'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#5528d1'}
                            onMouseLeave={e => e.currentTarget.style.background = '#673DE6'}
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            )}

            <style jsx global>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(30px) scale(0.9); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-6px); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes slideInUpPremium {
                    from { opacity: 0; transform: translateY(40px) scale(0.9) rotate(2deg); }
                    to { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
                }
                @keyframes slideInUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                @media (max-width: 768px) {
                    .vendo-chat-window {
                        width: calc(100vw - 32px) !important;
                        height: 70vh !important;
                        bottom: 16px !important;
                        right: 16px !important;
                    }
                    .vendo-toggle-btn {
                        bottom: 16px !important;
                        right: 16px !important;
                        width: 56px !important;
                        height: 56px !important;
                    }
                    .vendo-invite-card {
                        width: calc(100vw - 32px) !important;
                        bottom: 80px !important;
                        right: 16px !important;
                    }
                }
            `}</style>
        </div>
    )
}
