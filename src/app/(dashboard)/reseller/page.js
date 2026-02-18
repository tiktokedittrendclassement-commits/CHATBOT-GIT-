'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Copy, ExternalLink, Bot, CheckCircle2 } from 'lucide-react'
import styles from './reseller.module.css'

export default function ResellerPage() {
    const { user } = useAuth()
    const [profile, setProfile] = useState(null)
    const [chatbots, setChatbots] = useState([])
    const [loading, setLoading] = useState(true)
    const [copiedId, setCopiedId] = useState(null)

    useEffect(() => {
        if (!user) return

        const fetchData = async () => {
            // Get profile for tier check
            const { data: prof } = await supabase.from('profiles').select('plan_tier').eq('id', user.id).single()
            setProfile(prof)

            // Get chatbots with tokens
            const { data: bots } = await supabase
                .from('chatbots')
                .select('id, name, reseller_token')
                .eq('user_id', user.id)

            setChatbots(bots || [])
            setLoading(false)
        }

        fetchData()
    }, [user])

    const copyToClipboard = (token) => {
        const url = `${window.location.origin}/reseller/edit/${token}`
        navigator.clipboard.writeText(url)
        setCopiedId(token)
        setTimeout(() => setCopiedId(null), 2000)
    }

    if (loading) return <div>Chargement...</div>

    if (profile?.plan_tier !== 'agency' && profile?.plan_tier !== 'pro') {
        return (
            <div className={styles.lockedContainer}>
                <h2>Interface Revendeur</h2>
                <div className={styles.lockedCard}>
                    <p>Cette fonctionnalité est réservée aux comptes <strong>Agency</strong>.</p>
                    <p>Elle vous permet de donner un accès limité à vos clients pour qu'ils modifient eux-mêmes leur chatbot en marque blanche.</p>
                    <Button onClick={() => window.location.href = '/billing'}>Passer au Plan Agency</Button>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Interface Revendeur</h1>
                <p className={styles.subtitle}>Générez des liens "Éditeur Client" en marque blanche pour vos clients.</p>
            </div>

            <div className={styles.grid}>
                {chatbots.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Bot size={48} />
                        <p>Vous n'avez pas encore de chatbot. Créez-en un pour commencer à revendre !</p>
                    </div>
                ) : (
                    chatbots.map(bot => (
                        <div key={bot.id} className={styles.botCard}>
                            <div className={styles.botInfo}>
                                <h3 className={styles.botName}>{bot.name}</h3>
                                <p className={styles.botId}>ID: {bot.id.slice(0, 8)}...</p>
                            </div>
                            <div className={styles.actions}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(bot.reseller_token)}
                                    className={styles.copyBtn}
                                >
                                    {copiedId === bot.reseller_token ? (
                                        <><CheckCircle2 size={16} /> Copié !</>
                                    ) : (
                                        <><Copy size={16} /> Lien Client</>
                                    )}
                                </Button>
                                <a
                                    href={`/reseller/edit/${bot.reseller_token}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.previewLink}
                                >
                                    <ExternalLink size={16} />
                                    Aperçu
                                </a>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className={styles.infoBox}>
                <h3>Comment ça marche ?</h3>
                <ul>
                    <li><strong>1.</strong> Envoyez le "Lien Client" à votre client final.</li>
                    <li><strong>2.</strong> Votre client accède à une interface simplifiée 100% anonyme (pas de logo Vendo).</li>
                    <li><strong>3.</strong> Il peut modifier le nom, la couleur et les connaissances du bot à sa guise.</li>
                    <li><strong>4.</strong> Vous gardez le contrôle total sur la facturation et l'ID du bot.</li>
                </ul>
            </div>
        </div>
    )
}
