
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import styles from './page.module.css'
import Link from 'next/link'
import { Plus, Bot, Trash, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

export default function ChatbotsPage() {
    const { user } = useAuth()
    const [chatbots, setChatbots] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedChatbots, setSelectedChatbots] = useState([])

    useEffect(() => {
        if (!user) return

        const fetchChatbots = async () => {
            const { data } = await supabase
                .from('chatbots')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            setChatbots(data || [])
            setLoading(false)
        }

        fetchChatbots()
    }, [user])

    if (loading) return <div className={styles.loading}>Chargement des chatbots...</div>

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.heading}>Mes Chatbots</h1>
                    <p className={styles.subheading}>Gérez vos assistants IA</p>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    {chatbots.length > 0 && (
                        <Button
                            variant="outline"
                            onClick={() => {
                                if (selectedChatbots.length === chatbots.length) {
                                    setSelectedChatbots([])
                                } else {
                                    setSelectedChatbots(chatbots.map(b => b.id))
                                }
                            }}
                            style={{ fontSize: 14 }}
                        >
                            {selectedChatbots.length === chatbots.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                        </Button>
                    )}
                    {selectedChatbots.length > 0 && (
                        <Button
                            variant="destructive"
                            onClick={async () => {
                                if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedChatbots.length} chatbot(s) ?`)) return
                                const { error } = await supabase
                                    .from('chatbots')
                                    .delete()
                                    .in('id', selectedChatbots)
                                if (error) {
                                    alert('Erreur: ' + error.message)
                                } else {
                                    setChatbots(chatbots.filter(b => !selectedChatbots.includes(b.id)))
                                    setSelectedChatbots([])
                                }
                            }}
                            style={{ background: '#ef4444' }}
                        >
                            <Trash size={16} style={{ marginRight: 8 }} />
                            Supprimer ({selectedChatbots.length})
                        </Button>
                    )}
                    <Link href="/chatbots/new">
                        <Button size="lg">
                            <Plus size={18} style={{ marginRight: 8 }} />
                            Nouveau Chatbot
                        </Button>
                    </Link>
                </div>
            </div>

            <div className={styles.grid}>
                {chatbots.map(bot => (
                    <div
                        key={bot.id}
                        className={styles.card}
                        style={{
                            border: selectedChatbots.includes(bot.id) ? '2px solid #ef4444' : undefined,
                            background: selectedChatbots.includes(bot.id) ? '#fef2f2' : undefined
                        }}
                    >
                        <div className={styles.cardHeader}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <input
                                    type="checkbox"
                                    checked={selectedChatbots.includes(bot.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedChatbots([...selectedChatbots, bot.id])
                                        } else {
                                            setSelectedChatbots(selectedChatbots.filter(id => id !== bot.id))
                                        }
                                    }}
                                    style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#0F172A' }}
                                />
                                <div className={styles.botIcon} style={{ background: bot.color || '#000' }}>
                                    <Bot size={20} color="white" />
                                </div>
                                <div className={styles.botInfo}>
                                    <h3 className={styles.botName}>{bot.name}</h3>
                                    <div className={styles.botMeta}>
                                        <span>{new Date(bot.created_at).toLocaleDateString()}</span>
                                        <span className={styles.compactStat}>
                                            {bot.total_messages || 0} msgs
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ultra Compact Footer */}
                        <div className={styles.footer}>
                            <Link href={`/chatbots/${bot.id}`} style={{
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#0F172A',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                Configurer <ArrowUpRight size={14} />
                            </Link>
                        </div>
                    </div>
                ))}

                {chatbots.length === 0 && (
                    <div className={styles.emptyState}>
                        <Bot size={48} color="#cbd5e1" />
                        <h3>Aucun chatbot pour le moment</h3>
                        <p>Créez votre premier assistant IA pour commencer.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
