
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import styles from './page.module.css'
import Link from 'next/link'
import { Plus, Bot, MoreVertical, Edit, Trash, Settings } from 'lucide-react'
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
                        <Button>
                            <Plus size={20} style={{ marginRight: 8 }} />
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
                                style={{ width: 18, height: 18, cursor: 'pointer', marginRight: 12 }}
                            />
                            <div className={styles.botIcon} style={{ background: bot.color || '#000' }}>
                                <Bot size={24} color="white" />
                            </div>
                            <div className={styles.botInfo}>
                                <h3 className={styles.botName}>{bot.name}</h3>
                                <div className={styles.botMeta}>Créé le {new Date(bot.created_at).toLocaleDateString()}</div>
                            </div>
                            <div className={styles.actions}>
                                <Link href={`/chatbots/${bot.id}`}>
                                    <Button variant="ghost" size="sm"><Settings size={16} /></Button>
                                </Link>
                            </div>
                        </div>

                        <div className={styles.stats}>
                            <div className={styles.stat}>
                                <span className={styles.statLabel}>Total messages</span>
                                <span className={styles.statValue}>{bot.total_messages || 0}</span>
                            </div>
                        </div>

                        <div className={styles.footer}>
                            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                                <Link href={`/chatbots/${bot.id}`} style={{ flex: 1 }}>
                                    <Button variant="outline" className={styles.editBtn} style={{ width: '100%' }}>
                                        Modifier / Intégrer
                                    </Button>
                                </Link>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    style={{ backgroundColor: '#fee2e2', color: '#dc2626', borderColor: '#fecaca' }}
                                    onClick={async () => {
                                        if (!confirm('Êtes-vous sûr de vouloir supprimer ce chatbot ?')) return
                                        const { error } = await supabase.from('chatbots').delete().eq('id', bot.id)
                                        if (error) {
                                            alert('Erreur: ' + error.message)
                                        } else {
                                            setChatbots(chatbots.filter(b => b.id !== bot.id))
                                        }
                                    }}
                                >
                                    <Trash size={16} />
                                </Button>
                            </div>
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
