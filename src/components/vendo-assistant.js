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

    const handleSend = async (e) => {
        e.preventDefault()
        if (!input.trim() || isTyping) return

        const userMsgContent = input
        setInput('')

        const newMessages = [...messages, { role: 'user', content: userMsgContent }]
        setMessages(newMessages)
        setIsTyping(true)

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages,
                    chatbotId: 'VENDO_SUPPORT',
                    visitorId: 'vendo-visitor-' + Math.random().toString(36).substr(2, 9)
                })
            })

            if (!response.ok) throw new Error('Erreur API')

            const data = await response.json()

            if (data.content) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.content,
                    shouldType: true
                }])
            } else {
                throw new Error('Contenu vide')
            }
        } catch (error) {
            console.error('Chat error:', error)
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Désolé, j'ai rencontré un problème pour me connecter. Vérifiez que la clé API DeepSeek est bien configurée dans .env.local.",
                shouldType: true
            }])
        } finally {
            setIsTyping(false)
            setTimeout(scrollToBottom, 100)
        }
    }

    // Proactive Welcome Message & Event Listeners
    useEffect(() => {
        // Trigger welcome message after 1 second ONLY on the landing page
        if (pathname !== '/') return

        // Check if already shown in this session
        const alreadyShown = sessionStorage.getItem('vendo_teaser_shown')
        if (alreadyShown) return

        const timer = setTimeout(() => {
            if (!isOpen) {
                setTeaserText("Bonjour ! Je suis votre assistant IA. Je peux répondre à toutes vos questions sur Vendo. ✨")
                sessionStorage.setItem('vendo_teaser_shown', 'true')
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
    }, [pathname, isOpen])

    // Simple Auto-dismiss (5 seconds)
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
        <div className="vendo-assistant-root">

            {/* Premium Invite Card for Vendo Assistant */}
            {!isOpen && (
                <div
                    onClick={() => setIsOpen(true)}
                    className="vendo-invite-card"
                    style={{
                        position: 'fixed',
                        bottom: 110,
                        right: 30,
                        width: 320,
                        background: 'rgba(15, 23, 42, 0.9)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: 24,
                        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                        fontFamily: "inherit",
                        zIndex: 9998,
                        cursor: 'pointer',
                        transformOrigin: 'bottom right',
                        animation: 'slideInUpPremium 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards, float 4s ease-in-out infinite',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '4px'
                    }}
                >
                    <div style={{ padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                            <div
                                className="bot-icon-container"
                                style={{
                                    width: 50,
                                    height: 50,
                                    background: 'linear-gradient(135deg, #673DE6 0%, #8B5CF6 100%)',
                                    borderRadius: 16,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    boxShadow: '0 8px 16px rgba(103, 61, 230, 0.2)'
                                }}
                            >
                                <Bot size={26} />
                            </div>
                            <div style={{ position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, background: '#10B981', border: '3px solid #0f172a', borderRadius: '50%' }}></div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Assistant Vendo</div>
                            <div style={{ fontSize: 14.5, color: '#F1F5F9', fontWeight: 600, lineHeight: 1.5 }}>{teaserText}</div>
                        </div>
                    </div>
                    <div style={{
                        margin: '0 4px 4px',
                        padding: '10px 16px',
                        background: 'rgba(103, 61, 230, 0.1)',
                        borderRadius: 18,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>Maintenant</span>
                        <div style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            background: '#673DE6',
                            padding: '6px 12px',
                            borderRadius: 12,
                            boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
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
                        position: 'fixed',
                        bottom: 30,
                        right: 30,
                        width: 64,
                        height: 64,
                        borderRadius: '20px',
                        background: '#673DE6',
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
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
            )}

            {/* Chat Window */}
            {isOpen && (
                <div
                    className="vendo-chat-window"
                    style={{
                        position: 'fixed',
                        bottom: 30,
                        right: 30,
                        width: 400,
                        height: 600,
                        zIndex: 9999,
                        background: '#0B0E14',
                        borderRadius: 28,
                        boxShadow: '0 30px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
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
                            background: '#0B0E14',
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
                                    color: msg.role === 'user' ? '#fff' : '#F1F5F9',
                                    background: msg.role === 'user' ? '#673DE6' : '#1E293B',
                                    boxShadow: msg.role === 'user' ? '0 8px 16px rgba(103, 61, 230, 0.2)' : '0 2px 8px rgba(0,0,0,0.2)',
                                    border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.05)' : 'none',
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
                                <div style={{ width: 8, height: 8, background: '#475569', borderRadius: '50%', animation: 'bounce 1.4s infinite 0ms' }}></div>
                                <div style={{ width: 8, height: 8, background: '#475569', borderRadius: '50%', animation: 'bounce 1.4s infinite 200ms' }}></div>
                                <div style={{ width: 8, height: 8, background: '#475569', borderRadius: '50%', animation: 'bounce 1.4s infinite 400ms' }}></div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} style={{
                        padding: '20px 24px 30px',
                        background: '#0B0E14',
                        borderTop: '1px solid rgba(255,255,255,0.05)',
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
                                    border: '1.5px solid rgba(255,255,255,0.05)',
                                    borderRadius: '16px',
                                    padding: '14px 18px',
                                    fontSize: 14,
                                    outline: 'none',
                                    background: '#1E293B',
                                    transition: 'all 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
                                    fontWeight: 500,
                                    color: '#F1F5F9'
                                }}
                                onFocus={e => {
                                    e.currentTarget.style.border = '1.5px solid #673DE6'
                                    e.currentTarget.style.background = '#1E293B'
                                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(103, 61, 230, 0.15)'
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
                                boxShadow: '0 8px 16px rgba(103, 61, 230, 0.3)'
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
                        width: calc(100vw - 24px) !important;
                        height: calc(100vh - 35%) !important;
                        bottom: 12px !important;
                        right: 12px !important;
                        border-radius: 20px !important;
                    }
                    .vendo-toggle-btn {
                        bottom: 20px !important;
                        right: 20px !important;
                        width: 56px !important;
                        height: 56px !important;
                    }
                    .vendo-invite-card {
                        width: 280px !important;
                        bottom: 85px !important;
                        right: 20px !important;
                        border-radius: 20px !important;
                    }
                    .vendo-invite-card > div:first-child {
                        padding: 12px !important;
                        gap: 10px !important;
                    }
                    .vendo-invite-card .bot-icon-container {
                        width: 36px !important;
                        height: 36px !important;
                    }
                    .vendo-invite-card .bot-icon-container svg {
                        width: 18px !important;
                        height: 18px !important;
                    }
                    .vendo-invite-card .teaser-title {
                        font-size: 11px !important;
                    }
                    .vendo-invite-card .teaser-text {
                        font-size: 13px !important;
                        line-height: 1.3 !important;
                    }
                    .vendo-invite-card .teaser-footer {
                        padding: 8px 12px !important;
                    }
                    .vendo-invite-card .teaser-footer span {
                        font-size: 10px !important;
                    }
                    .vendo-invite-card .teaser-footer div {
                        padding: 4px 10px !important;
                        font-size: 12px !important;
                    }
                }
            `}</style>
        </div>
    )
}
