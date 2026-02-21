'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot } from 'lucide-react'

export default function DemoChatStore({ context }) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState(() => {
        if (context?.knowledgeBase) {
            return [{ role: 'assistant', content: `Salut ! Je suis Léa 🌿 Tu cherches le bon soin ou tu as une question sur ta commande ?` }]
        }
        return [{ role: 'assistant', content: 'Bienvenue chez V-ATHLETICS. Je suis votre coach personnel Vendo. En quoi puis-je vous aider aujourd\'hui ?' }]
    })

    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesContainerRef = useRef(null)

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            const { scrollHeight, clientHeight } = messagesContainerRef.current
            messagesContainerRef.current.scrollTop = scrollHeight - clientHeight
        }
    }

    useEffect(() => {
        if (!context) return;
        let proactiveMsg = "";
        if (context.view === 'cart' && context.cart?.length > 0) {
            proactiveMsg = `Vous avez une excellente sélection dans votre panier. Le total est de ${context.total?.toFixed(2)} €. Souhaitez-vous finaliser votre commande ?`;
        } else if (context.view === 'checkout') {
            proactiveMsg = `Vous êtes à l'étape finale. N'oubliez pas que la livraison est offerte. Une question sur les délais ?`;
        } else if (context.product) {
            proactiveMsg = `Vous regardez le ${context.product.name}. C'est l'un de nos articles les plus recherchés en ce moment.`;
        }
        if (proactiveMsg) {
            setIsOpen(true);
            setMessages(prev => [...prev, { role: 'assistant', content: proactiveMsg }]);
        }
    }, [context?.view, context?.product?.id])

    useEffect(() => {
        scrollToBottom()
        const timeout = setTimeout(scrollToBottom, 50)
        return () => clearTimeout(timeout)
    }, [messages.length, isOpen, isTyping])

    const handleSend = async (e) => {
        e.preventDefault()
        if (!input.trim() || isTyping) return

        const userMsgContent = input
        setInput('')

        const newMessages = [...messages, { role: 'user', content: userMsgContent }]
        setMessages(newMessages)
        setIsTyping(true)

        try {
            let apiMessages = [...newMessages]

            if (context || context?.knowledgeBase) {
                let systemContext = ""
                const kb = context?.knowledgeBase

                if (kb && kb.system_prompt) {
                    systemContext = kb.system_prompt
                    systemContext += `\n\n--- DONNÉES DU SITE ---\n`
                    systemContext += `
BRAND IDENTITY:
Name: ${kb.brand.name}
Values: ${kb.brand.values.join(', ')}

PRODUCTS (${kb.products.length} items):
${kb.products.map(p => `- ${p.name} (${p.price}€): ${p.short_description}. Ingredients: ${p.key_ingredients.map(i => `${i.name} (${i.concentration || ''})`).join(', ')}. Use: ${p.how_to_use}.`).join('\n')}

SUPPORT POLICIES:
Shipping: Free > ${kb.shipping.free_shipping_threshold}€. Carriers: ${kb.shipping.carriers.map(c => c.name).join(', ')}.
Returns: ${kb.returns.return_window_days} days.
FAQ: ${kb.faq.map(f => `Q: ${f.question} A: ${f.answer}`).join(' ')}
`
                    systemContext += `\n\n--- CONTEXTE UTILISATEUR ---\nPage: ${context?.view || 'home'}. Panier: ${context?.cartTotal?.toFixed(2) || '0'}€.`
                } else {
                    systemContext = `CONTEXT: User is on ${context?.storeType || 'V-ATHLETICS'}. View: ${context?.view || 'home'}. Cart Total: ${context?.cartTotal?.toFixed(2) || '0.00'} €.`
                    if (kb) {
                        systemContext += `\nBRAND: ${kb.brand.name}\nPRODUCTS:\n${kb.products.map(p => `- ${p.name} (${p.price}€): ${p.short_description}.`).join('\n')}\nShipping: Free > ${kb.shipping.free_shipping_threshold}€. Returns: ${kb.returns.return_window_days} days.`
                    }
                    if (context?.product) {
                        systemContext += `\nCurrently viewing: ${context.product.name} (${context.product.price} €).`
                    }
                    systemContext += `\nROLE: You are the expert consultant.`
                }

                apiMessages = [{ role: 'system', content: systemContext }, ...apiMessages]
            }

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: apiMessages,
                    chatbotId: 'DEMO',
                    visitorId: 'demo-visitor-' + Math.random().toString(36).substr(2, 9)
                })
            })

            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json()

            if (data.content) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.content }])
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: "Désolé, j'ai eu un petit problème technique." }])
            }
        } catch (error) {
            if (error.name === 'AbortError') return;
            console.error('Chat error:', error)
            setMessages(prev => [...prev, { role: 'assistant', content: "Oups, je n'arrive pas à joindre le serveur." }])
        } finally {
            setIsTyping(false)
        }
    }

    const brandColor = '#c8a882'
    const brandColorDark = '#a88b68'
    const brandName = context?.knowledgeBase?.brand?.name || 'Naturel'

    return (
        <div style={{ fontFamily: "'Inter', sans-serif", position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 900 }}>

            {/* Toggle Button */}
            {!isOpen && (
                <div
                    className="demo-chat-toggle"
                    style={{ position: 'absolute', bottom: 30, right: 40, zIndex: 900, pointerEvents: 'auto' }}
                >
                    <button
                        onClick={() => setIsOpen(true)}
                        style={{
                            width: 64,
                            height: 64,
                            borderRadius: '20px',
                            background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColorDark} 100%)`,
                            color: 'white',
                            border: 'none',
                            boxShadow: `0 20px 40px rgba(200, 168, 130, 0.4)`,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            position: 'relative',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
                    >
                        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 28, color: 'white', lineHeight: 1 }}>N</span>
                        <div style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, background: '#10B981', borderRadius: '50%' }}></div>
                    </button>
                </div>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div
                    className="demo-chat-window"
                    style={{
                        position: 'absolute',
                        bottom: 30,
                        right: 40,
                        width: 400,
                        height: 600,
                        zIndex: 1000,
                        background: '#FFFFFF',
                        borderRadius: 28,
                        boxShadow: '0 30px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        animation: 'demoSlideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        transformOrigin: 'bottom right',
                        pointerEvents: 'auto'
                    }}
                >
                    {/* Header */}
                    <div style={{
                        background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColorDark} 100%)`,
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
                                background: 'rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(10px)',
                                width: 44,
                                height: 44,
                                borderRadius: 14,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.3)'
                            }}>
                                <Bot size={22} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: '-0.4px' }}>Conseiller {brandName}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div style={{ width: 6, height: 6, background: '#10B981', borderRadius: '50%', boxShadow: '0 0 10px #10B981' }}></div>
                                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Assistant Expert Connecté</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: 'rgba(255,255,255,0.15)',
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
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
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
                                    background: msg.role === 'user' ? brandColor : '#FFFFFF',
                                    boxShadow: msg.role === 'user' ? `0 8px 16px rgba(200,168,130,0.25)` : '0 2px 8px rgba(0,0,0,0.04)',
                                    border: msg.role === 'assistant' ? '1px solid rgba(0,0,0,0.03)' : 'none',
                                    whiteSpace: 'pre-wrap',
                                    fontWeight: 500
                                }}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div style={{ display: 'flex', gap: 6, paddingLeft: 8 }}>
                                <div style={{ width: 8, height: 8, background: '#CED4DA', borderRadius: '50%', animation: 'demoBounce 1.4s infinite 0ms' }}></div>
                                <div style={{ width: 8, height: 8, background: '#CED4DA', borderRadius: '50%', animation: 'demoBounce 1.4s infinite 200ms' }}></div>
                                <div style={{ width: 8, height: 8, background: '#CED4DA', borderRadius: '50%', animation: 'demoBounce 1.4s infinite 400ms' }}></div>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div style={{ padding: '0 24px 12px', background: '#F8FAFC', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
                        {['Soins visage', 'Ma commande', 'Ingrédients', 'Diagnostic'].map(label => (
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
                                onClick={() => setInput(label)}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = brandColor; e.currentTarget.style.color = brandColorDark; }}
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
                                placeholder="Posez votre question..."
                                style={{
                                    width: '100%',
                                    border: '1.5px solid #F1F5F9',
                                    borderRadius: '16px',
                                    padding: '14px 18px',
                                    fontSize: 14,
                                    outline: 'none',
                                    background: '#F8FAFC',
                                    transition: 'all 0.3s',
                                    fontWeight: 500,
                                    color: '#1E293B'
                                }}
                                onFocus={e => {
                                    e.currentTarget.style.border = `1.5px solid ${brandColor}`
                                    e.currentTarget.style.background = '#FFFFFF'
                                    e.currentTarget.style.boxShadow = `0 0 0 4px rgba(200,168,130,0.15)`
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
                                boxShadow: `0 8px 16px rgba(200,168,130,0.3)`
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = brandColorDark}
                            onMouseLeave={e => e.currentTarget.style.background = brandColor}
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            )}

            <style jsx global>{`
                @keyframes demoSlideIn {
                    from { opacity: 0; transform: translateY(30px) scale(0.9); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes demoBounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-6px); }
                }
                @media (max-width: 768px) {
                    .demo-chat-window {
                        width: calc(100vw - 24px) !important;
                        height: calc(100vh - 24px) !important;
                        bottom: 12px !important;
                        right: 12px !important;
                        border-radius: 20px !important;
                    }
                    .demo-chat-toggle {
                        bottom: 20px !important;
                        right: 20px !important;
                    }
                }
            `}</style>
        </div>
    )
}
