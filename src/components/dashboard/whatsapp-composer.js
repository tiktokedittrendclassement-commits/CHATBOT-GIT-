'use client'

import { useState, useEffect } from 'react'
import { X, Send, Phone, MessageSquare } from 'lucide-react'
import styles from './whatsapp-composer.module.css'

export default function WhatsAppComposer({ isOpen, onClose, onSend, leadsCount, phoneId = '', initialMessage = '' }) {
    const [message, setMessage] = useState(initialMessage)
    const [isSending, setIsSending] = useState(false)

    useEffect(() => {
        if (initialMessage) {
            setMessage(initialMessage)
        }
    }, [initialMessage])

    if (!isOpen) return null

    const handleSend = async () => {
        if (!message.trim()) return
        setIsSending(true)
        await onSend(message)
        setIsSending(false)
        setMessage('')
    }

    return (
        <div className={styles.composer}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.title}>NOUVELLE CAMPAGNE WHATSAPP ({leadsCount} contacts)</div>
                <div className={styles.headerActions}>
                    {onClose && (
                        <button className={styles.actionBtn} onClick={onClose}>
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            <div className={styles.body}>
                <div className={styles.inputGroup}>
                    <span className={styles.inputLabel}>De</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', color: '#fff', fontWeight: 600 }}>
                        <Phone size={14} color="#25D366" />
                        {phoneId || '(Numéro non configuré)'}
                    </div>
                </div>
                <div className={styles.inputGroup}>
                    <span className={styles.inputLabel}>À</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', color: '#fff' }}>
                        <MessageSquare size={14} color="rgba(255,255,255,0.4)" />
                        Tous vos leads ({leadsCount})
                    </div>
                </div>
            </div>

            {/* Editor Area */}
            <div className={styles.editorContainer}>
                <textarea
                    className={styles.textarea}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Écrivez votre message WhatsApp ici..."
                />
                <div className={styles.tip}>
                    Note : Utilisez un message clair. Les liens sont cliquables une fois reçus par le client.
                </div>
            </div>

            {/* Footer */}
            <div className={styles.footer}>
                <button
                    className={styles.sendBtn}
                    onClick={handleSend}
                    disabled={!message.trim() || isSending}
                >
                    {isSending ? 'Envoi...' : 'Envoyer la Campagne'} <Send size={16} />
                </button>
            </div>
        </div>
    )
}
