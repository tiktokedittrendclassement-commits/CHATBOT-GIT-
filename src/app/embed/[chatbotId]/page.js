
'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './page.module.css'
import { Send, X, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useParams } from 'next/navigation'

export default function EmbedPage() {
    const params = useParams()
    const [isOpen, setIsOpen] = useState(false) // For toggle state if we control it inside iframe (often iframe is always open, but let's assume iframe is the widget)
    // Actually, usually the iframe is the WHOLE widget (bubble + chat window). 
    // If we open/close, we might need to communicate with parent window to resize iframe.
    // For MVP, lets assume the iframe is just the chat WINDOW and it's always "open" inside the iframe, 
    // but the script hides/shows the iframe. 
    // OR the iframe includes the bubble.
    // approach: The page is the chat window. The script handles the bubble and iframe toggling.
    // Wait, if the script handles the bubble, the bubble is in the PARENT.
    // That's better for performance/styling.
    // So this page is ONLY the chat window.

    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [botConfig, setBotConfig] = useState(null)
    const [error, setError] = useState(null)
    const messagesEndRef = useRef(null)

    useEffect(() => {
        // Fetch bot details
        const fetchBot = async () => {
            const { data, error } = await supabase
                .from('chatbots')
                .select('name, color, welcome_message_new, welcome_message_returning, triggers') // Only public info
                .eq('id', params.chatbotId)
                .single()

            if (error) {
                setError('Chatbot introuvable')
            } else {
                setBotConfig(data)

                // Check for returning visitor
                const isReturning = typeof window !== 'undefined' && localStorage.getItem(`vendo_returning_${params.chatbotId}`)

                // --- SMART WELCOME LOGIC ---
                let greeting = data.welcome_message_new
                let status = 'new_visitor'

                // 1. Check for Returning Visitor
                if (isReturning && data.welcome_message_returning) {
                    greeting = data.welcome_message_returning
                    status = 'returning_visitor'
                }

                // 2. Check for Context (Test/Demo Page)
                const isTestPage = typeof document !== 'undefined' && (
                    document.referrer.includes('demo') ||
                    document.referrer.includes('test') ||
                    document.referrer.includes('localhost')
                );

                if (params.chatbotId === '00f3e398-49df-4492-b1cf-f681cc9d7196' && isTestPage) {
                    greeting = "Bonjour ! 👋 Je suis l'assistant Vendo. C'est ici que vous pouvez tester mon intégration."
                    status = 'demo_mode'
                }

                // SEND INIT DATA TO PARENT (Triggers, etc.)
                // We send this immediately so the parent script can set up listeners
                if (typeof window !== 'undefined') {
                    window.parent.postMessage({
                        type: 'vendo-init-triggers',
                        chatbotId: params.chatbotId,
                        triggers: data.triggers || []
                    }, '*');
                }

                // Initial greeting - ONLY if string is not empty
                if (greeting && greeting.trim().length > 0) {
                    setMessages([{
                        role: 'assistant',
                        content: greeting
                    }])

                    // Proactive Trigger: Send message to parent window (the embedding site)
                    setTimeout(() => {
                        window.parent.postMessage({
                            type: 'vendo-proactive-message',
                            chatbotId: params.chatbotId,
                            message: greeting,
                            sender: data.name || 'Assistant',
                            avatar: data.logo_url // Corrected field name from avatar_url
                        }, '*');
                    }, 2000);
                }
            }
        }
        fetchBot()
    }, [params.chatbotId])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async (e) => {
        e.preventDefault()
        if (!input.trim() || loading) return

        const userMessage = { role: 'user', content: input }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setLoading(true)

        try {
            // Call API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage], // Send history
                    chatbotId: params.chatbotId,
                    // visitorId: ... // We could generate one
                })
            })

            const data = await response.json()

            if (data.error) throw new Error(data.error)

            setMessages(prev => [...prev, { role: 'assistant', content: data.content }])
        } catch (err) {
            if (err.name === 'AbortError') return;
            console.error(err)
            setMessages(prev => [...prev, { role: 'assistant', content: 'Désolé, une erreur est survenue.' }])
        } finally {
            setLoading(false)
        }
    }

    if (error) return <div className={styles.error}>{error}</div>
    if (!botConfig) return <div className={styles.loading}>Chargement...</div>

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header} style={{ backgroundColor: botConfig.color }}>
                <div className={styles.headerTitle}>
                    {botConfig.name}
                </div>
            </div>

            {/* Messages */}
            <div className={styles.messages}>
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={cn(
                            styles.messageRow,
                            msg.role === 'user' ? styles.userRow : styles.botRow
                        )}
                    >
                        <div
                            className={styles.messageBubble}
                            style={{
                                backgroundColor: msg.role === 'user' ? botConfig.color : '#f1f5f9',
                                color: msg.role === 'user' ? '#fff' : '#0f172a'
                            }}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className={styles.messageRow}>
                        <div className={styles.typingIndicator}>...</div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className={styles.inputArea}>
                <input
                    className={styles.input}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Écrivez votre message..."
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className={styles.sendBtn}
                    style={{ color: botConfig.color }}
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    )
}
