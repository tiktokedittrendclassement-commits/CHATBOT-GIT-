
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import styles from './page.module.css'
import { Check, CreditCard, Trash, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PLANS = [
    {
        id: 'free',
        name: 'Gratuit',
        price: '0€/mois',
        features: ['1 Chatbot', '1000 messages (Total)', 'Personnalisation Basique', 'Support Communautaire', 'Crédits à la demande'],
        current: true // Default logic handling below
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '49€/mois',
        features: ['10 Chatbots', 'Messages illimités', 'Email Marketing', 'Nom du Bot Personnalisé', 'Photos Produits', 'Relance Panier'],
        link: 'https://test.lemonsqueezy.com/checkout/...' // Placeholder
    },
    {
        id: 'agency',
        name: 'Agence',
        price: '249€/mois',
        features: ['Chatbots illimités', 'Messages illimités', 'Marketing WhatsApp', 'Droits de Revente', 'Marque Blanche', 'Popups Intelligents'],
        link: 'https://test.lemonsqueezy.com/checkout/...' // Placeholder
    }
]

export default function BillingPage() {
    const { user } = useAuth()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    // Modal state for chatbot deletion
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [chatbots, setChatbots] = useState([])
    const [selectedChatbots, setSelectedChatbots] = useState([])
    const [targetPlan, setTargetPlan] = useState(null)
    const [requiredDeletions, setRequiredDeletions] = useState(0)

    useEffect(() => {
        if (!user) return
        const fetchProfile = async () => {
            const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
            setProfile(data)
            setLoading(false)
        }
        fetchProfile()
    }, [user])

    const handlePlanChange = async (newPlan) => {
        const PLAN_LIMITS = { free: 1, pro: 10, agency: 999999 }

        // Count current chatbots
        const { data: userChatbots, count } = await supabase
            .from('chatbots')
            .select('*', { count: 'exact' })
            .eq('user_id', user.id)

        const newLimit = PLAN_LIMITS[newPlan]

        if (count > newLimit) {
            // Show deletion modal
            setChatbots(userChatbots || [])
            setTargetPlan(newPlan)
            setRequiredDeletions(count - newLimit)
            setSelectedChatbots([])
            setShowDeleteModal(true)
        } else {
            // Can change directly
            if (newPlan === 'free') {
                // Rename all chatbots for free plan
                await supabase
                    .from('chatbots')
                    .update({ name: 'Mon Assistant Vendo' })
                    .eq('user_id', user.id)
            }

            await supabase.from('profiles').update({ plan_tier: newPlan }).eq('id', user.id)
            window.location.reload()
        }
    }

    const handleConfirmDeletion = async () => {
        if (selectedChatbots.length < requiredDeletions) {
            alert(`Veuillez sélectionner au moins ${requiredDeletions} chatbot(s) à supprimer.`)
            return
        }

        // Delete selected chatbots
        const { error } = await supabase
            .from('chatbots')
            .delete()
            .in('id', selectedChatbots)

        if (error) {
            alert('Erreur lors de la suppression: ' + error.message)
            return
        }

        // Apply plan restrictions if downgrading to free
        if (targetPlan === 'free') {
            await supabase
                .from('chatbots')
                .update({ name: 'Mon Assistant Vendo' })
                .eq('user_id', user.id)
                .not('id', 'in', `(${selectedChatbots.join(',')})`)
        }

        // Change plan
        await supabase.from('profiles').update({ plan_tier: targetPlan }).eq('id', user.id)
        window.location.reload()
    }

    if (loading) return <div className={styles.loading}>Chargement de l'abonnement...</div>

    return (
        <div className={styles.container}>
            <h1 className={styles.heading}>Mon Abonnement</h1>
            <p className={styles.subheading}>Gérez votre forfait et vos limites.</p>

            <div className={styles.infoBox}>
                <div className={styles.infoIcon}>
                    <AlertCircle size={20} color="#673DE6" />
                </div>
                <div className={styles.infoContent}>
                    <div className={styles.infoTitle}>Fonctionnement de l'abonnement</div>
                    <p className={styles.infoText}>
                        <strong>Abonnement :</strong> Débloque les fonctionnalités (nombre de chatbots, marketing, marque blanche).<br />
                        <strong>Portefeuille :</strong> Payez uniquement ce que vous consommez (réponses IA) via des crédits.
                    </p>
                </div>
            </div>

            <div className={styles.grid}>
                {PLANS.map(plan => {
                    const isCurrent = profile?.plan_tier === plan.id || (plan.id === 'free' && !profile?.plan_tier)
                    const isRecommended = plan.id === 'agency'

                    return (
                        <div key={plan.id} className={`${styles.card} ${isRecommended && !isCurrent ? styles.recommendedCard : ''}`}>
                            {isRecommended && !isCurrent && <div className={styles.badge}>Recommandé</div>}

                            <div className={styles.cardHeader}>
                                <h3 className={styles.planName}>{plan.name}</h3>
                                <div className={styles.price}>{plan.price}</div>
                            </div>

                            <ul className={styles.features}>
                                {plan.features.map((f, i) => (
                                    <li key={i} className={styles.feature}>
                                        <Check size={16} className={styles.checkIcon} />
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <div className={styles.action}>
                                {isCurrent ? (
                                    <Button disabled size="md" className={styles.currentBtn}>Plan Actuel</Button>
                                ) : (
                                    <a href={plan.link || '#'} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                                        <Button size="md">
                                            Choisir {plan.name}
                                        </Button>
                                    </a>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* DEBUG SECTION FOR TESTING */}
            <div className={styles.testZone}>
                <h3 className={styles.testTitle}>🛠️ Zone de Test (Admin Only)</h3>
                <div style={{ display: 'flex', gap: 12 }}>
                    <Button variant="outline" onClick={() => handlePlanChange('free')}>
                        Force Free
                    </Button>
                    <Button variant="outline" onClick={() => handlePlanChange('pro')}>
                        Force Pro
                    </Button>
                    <Button variant="outline" onClick={() => handlePlanChange('agency')}>
                        Force Agency
                    </Button>
                </div>
            </div>

            {/* Chatbot Deletion Modal */}
            {showDeleteModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: '#0F172A',
                        borderRadius: 24,
                        padding: 32,
                        maxWidth: 600,
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
                                Sélectionner les chatbots à supprimer
                            </h2>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: 8,
                                    color: 'rgba(255, 255, 255, 0.4)'
                                }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{
                            padding: 16,
                            background: 'rgba(245, 158, 11, 0.05)',
                            borderRadius: 12,
                            marginBottom: 24,
                            border: '1px solid rgba(245, 158, 11, 0.2)'
                        }}>
                            <p style={{ margin: 0, color: '#f59e0b', fontSize: 14 }}>
                                ⚠️ Vous devez supprimer <strong>{requiredDeletions}</strong> chatbot(s) pour passer au plan{' '}
                                <strong>{targetPlan === 'free' ? 'Gratuit' : 'Pro'}</strong>.
                            </p>
                            <p style={{ margin: '8px 0 0 0', color: 'rgba(255, 255, 255, 0.5)', fontSize: 13 }}>
                                Sélectionnés: {selectedChatbots.length} / {requiredDeletions} minimum
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                            {chatbots.map(bot => (
                                <label
                                    key={bot.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        padding: 16,
                                        border: selectedChatbots.includes(bot.id) ? '2px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.08)',
                                        borderRadius: 16,
                                        cursor: 'pointer',
                                        background: selectedChatbots.includes(bot.id) ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255, 255, 255, 0.03)',
                                        transition: 'all 0.2s'
                                    }}
                                >
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
                                        style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--primary)' }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, marginBottom: 4, color: '#fff' }}>{bot.name}</div>
                                        <div style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.4)' }}>
                                            Créé le {new Date(bot.created_at).toLocaleDateString('fr-FR')}
                                        </div>
                                    </div>
                                    {selectedChatbots.includes(bot.id) && (
                                        <Trash size={20} style={{ color: '#ef4444' }} />
                                    )}
                                </label>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Annuler
                            </Button>
                            <Button
                                onClick={handleConfirmDeletion}
                                disabled={selectedChatbots.length < requiredDeletions}
                                style={{
                                    background: selectedChatbots.length >= requiredDeletions ? '#ef4444' : 'rgba(255, 255, 255, 0.05)',
                                    color: selectedChatbots.length >= requiredDeletions ? 'white' : 'rgba(255, 255, 255, 0.2)',
                                    cursor: selectedChatbots.length >= requiredDeletions ? 'pointer' : 'not-allowed',
                                    border: '1px solid ' + (selectedChatbots.length >= requiredDeletions ? '#ef4444' : 'rgba(255, 255, 255, 0.08)')
                                }}
                            >
                                Supprimer {selectedChatbots.length} chatbot(s) et changer de plan
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
