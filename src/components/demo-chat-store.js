'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot } from 'lucide-react'

export default function DemoChatStore({ context }) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState(() => {
        if (context?.knowledgeBase) {
            // Check for specific persona name in system prompt or fallback
            return [{ role: 'assistant', content: `Salut ! Je suis Léa 🌿 Tu cherches le bon soin ou tu as une question sur ta commande ?` }]
        }
        return [{ role: 'assistant', content: 'Bienvenue chez V-ATHLETICS. Je suis votre coach personnel Vendo. En quoi puis-je vous aider aujourd\'hui ?' }]
    })


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

    // Effect to handle view/context changes
    useEffect(() => {
        if (!context) return;

        let proactiveMsg = "";

        if (context.view === 'cart' && context.cart?.length > 0) {
            proactiveMsg = `Vous avez une excellente sélection dans votre panier. Le total est de ${context.total.toFixed(2)} €. Souhaitez-vous finaliser votre commande ou avez-vous besoin d'un conseil sur l'un des articles ?`;
        } else if (context.view === 'checkout') {
            proactiveMsg = `Vous êtes à l'étape finale. N'oubliez pas que la livraison est offerte pour cette collection. Une question sur les délais ?`;
        } else if (context.view === 'faq') {
            proactiveMsg = `Besoin d'aide ? Je connais toutes nos procédures d'expédition et de retour sur le bout des doigts. Qu'est-ce qui vous tracasse ?`;
        } else if (context.product) {
            const p = context.product;
            if (p.category === "Outerwear") {
                proactiveMsg = `Le ${p.name} est une pièce maîtresse. La laine vierge est traitée pour durer des décennies. Une question sur la coupe ?`;
            } else {
                proactiveMsg = `Vous regardez le ${p.name}. C'est l'un de nos articles les plus recherchés en ce moment.`;
            }
        }

        if (proactiveMsg) {
            setIsOpen(true);
            setMessages(prev => [...prev, { role: 'assistant', content: proactiveMsg }]);
        }
    }, [context?.view, context?.product?.id])

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
        if (!input.trim() || isTyping) return

        const userMsgContent = input
        setInput('')

        const newMessages = [...messages, { role: 'user', content: userMsgContent }]
        setMessages(newMessages)
        setIsTyping(true)

        try {
            // Prepare messages for API
            let apiMessages = [...newMessages]

            if (context || context?.knowledgeBase) {
                let systemContext = ""
                const kb = context?.knowledgeBase

                if (kb && kb.system_prompt) {
                    // USE CUSTOM SYSTEM PROMPT
                    systemContext = kb.system_prompt

                    // APPEND CONTEXT & DATA
                    systemContext += `\n\n--- DONNÉES DU SITE (SOURCE DE VÉRITÉ) ---\n`

                    // We re-inject the data so the LLM actually has the info the prompt refers to
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

                    // APPEND CURRENT USER CONTEXT
                    systemContext += `\n\n--- CONTEXTE UTILISATEUR ACTUEL ---\nExample: User is on ${context?.view || 'home'}. Cart: ${context?.cartTotal?.toFixed(2) || '0'}€. Viewed Product: ${context?.product?.name || 'None'}.`

                } else {
                    // FALLBACK LEGACY GENERATION
                    systemContext = `CONTEXT IMMERSION: User is on ${context?.storeType || 'V-ATHLETICS'}. 
Current View: ${context?.view || 'home'}.
Cart Contents: ${context?.cart?.map(i => i.name).join(', ') || 'Empty'}.
Cart Total: ${context?.cartTotal?.toFixed(2) || '0.00'} €.
`;

                    if (context?.knowledgeBase) {
                        systemContext += `\nBRAND IDENTITY: ... (Legacy generation) ...`
                        // (Simplified for brevity as this branch is for non-custom prompts)
                        const kb = context.knowledgeBase
                        systemContext += `
BRAND IDENTITY:
Name: ${kb.brand.name}
Slogan: ${kb.brand.slogan}

PRODUCTS KNOWLEDGE:
${kb.products.map(p => `- ${p.name} (${p.price}€): ${p.short_description}.`).join('\n')}

SUPPORT POLICIES:
Shipping: Free > ${kb.shipping.free_shipping_threshold}€.
Returns: ${kb.returns.return_window_days} days.
`
                    } else {
                        systemContext += `
KNOWLEDGE BASE:
- Livraison: 24h.
- Contact: Support privé.`;
                    }

                    if (context?.product) {
                        systemContext += `\nCurrently viewing: ${context.product.name} (${context.product.price} €).`;
                    }
                    systemContext += `\nROLE: You are the expert consultant.`
                }

                apiMessages = [
                    {
                        role: 'system',
                        content: systemContext
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
                            borderRadius: 20,
                            background: context?.knowledgeBase ? 'linear-gradient(135deg, #c8a882 0%, #a88b68 100%)' : 'linear-gradient(135deg, #000 0%, #333 100%)',
                            color: 'white',
                            border: 'none',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <div style={{ position: 'relative', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 16 }}>
                            {context?.knowledgeBase?.brand?.logo_url === 'ICON:BOT' ? (
                                <Bot size={32} />
                            ) : context?.knowledgeBase?.brand?.logo_url && (context.knowledgeBase.brand.logo_url.startsWith('http') || context.knowledgeBase.brand.logo_url.startsWith('/') || context.knowledgeBase.brand.logo_url.startsWith('data:')) ? (
                                <img src={context.knowledgeBase.brand.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                            ) : (
                                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 24 }}>
                                    {context?.knowledgeBase?.brand?.logo_url || context?.knowledgeBase?.brand?.name?.charAt(0) || 'V'}
                                </span>
                            )}
                            <div style={{ position: 'absolute', top: -4, right: -4, width: 10, height: 10, background: '#22C55E', borderRadius: '50%', border: '2px solid #000' }}></div>
                        </div>
                    </button>
                </div>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    width: 380,
                    height: 580,
                    background: 'white',
                    borderRadius: 24,
                    boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    border: '1px solid #f1f5f9',
                    animation: 'slideUp 0.4s cubic-bezier(0.2, 1, 0.3, 1)',
                    transformOrigin: 'bottom right'
                }}>
                    {/* Header */}
                    <div style={{ background: '#000', padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{ background: context?.knowledgeBase ? 'linear-gradient(135deg, #c8a882 0%, #a88b68 100%)' : 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', padding: 0, borderRadius: 12, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, overflow: 'hidden', fontSize: 20, fontWeight: 'bold' }}>
                                    <Bot size={24} />
                                </div>
                                <div style={{ position: 'absolute', bottom: -4, right: -4, width: 14, height: 14, background: '#22C55E', borderRadius: '50%', border: '3px solid #000' }}></div>
                            </div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: '-0.5px' }}>{context?.knowledgeBase ? `Conseiller ${context.knowledgeBase.brand.name}` : 'Coach Vendo'}</div>
                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{context?.knowledgeBase ? 'Assistant Expert' : 'V-ATHLETICS Assistant'}</div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', padding: 10, borderRadius: 12, transition: 'all 0.2s' }}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div
                        ref={messagesContainerRef}
                        style={{ flex: 1, padding: '24px', overflowY: 'auto', background: '#fff', display: 'flex', flexDirection: 'column', gap: 20 }}
                    >
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                <div style={{ display: 'flex', gap: 12, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', maxWidth: '90%' }}>
                                    {msg.role === 'assistant' && (
                                        <div style={{ width: 32, height: 32, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', flexShrink: 0, marginTop: 4, overflow: 'hidden', fontWeight: 'bold', fontSize: 14 }}>
                                            <Bot size={18} />
                                        </div>
                                    )}
                                    {msg.content && (
                                        <div style={{
                                            padding: '14px 18px',
                                            borderRadius: 18,
                                            fontSize: 14,
                                            lineHeight: '1.6',
                                            color: msg.role === 'user' ? '#fff' : '#1f2937',
                                            background: msg.role === 'user' ? (context?.knowledgeBase ? '#c8a882' : '#000') : '#f3f4f6',
                                            boxShadow: msg.role === 'user' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                                            borderTopLeftRadius: msg.role === 'assistant' ? 4 : 18,
                                            borderTopRightRadius: msg.role === 'user' ? 4 : 18,
                                            whiteSpace: 'pre-wrap',
                                            fontWeight: 500,
                                            border: 'none'
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
                        <button type="submit" style={{ background: context?.knowledgeBase ? '#c8a882' : '#000', color: '#fff', width: 48, height: 48, borderRadius: 0, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)', transition: 'all 0.2s' }}>
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
