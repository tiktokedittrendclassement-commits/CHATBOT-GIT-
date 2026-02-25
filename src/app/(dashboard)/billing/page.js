
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

            {/* Chatbot Deletion Modal Overhaul */}
            {showDeleteModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Sélectionner les chatbots à supprimer</h2>
                            <button className={styles.closeBtn} onClick={() => setShowDeleteModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.warningBox}>
                            <div className={styles.warningHeader}>
                                <AlertCircle size={18} />
                                <span>Action requise</span>
                            </div>
                            <p className={styles.infoText} style={{ color: '#ef4444', fontWeight: 700, opacity: 1, marginBottom: 8 }}>
                                Supprimez {requiredDeletions} chatbot(s) pour passer au plan {targetPlan === 'free' ? 'Gratuit' : 'Pro'}.
                            </p>
                            <div className={styles.warningSub}>
                                Sélectionnés: {selectedChatbots.length} sur {requiredDeletions} minimum
                            </div>
                        </div>

                        <div className={styles.botList}>
                            {chatbots.map(bot => {
                                const isSelected = selectedChatbots.includes(bot.id)
                                return (
                                    <div
                                        key={bot.id}
                                        className={`${styles.botCard} ${isSelected ? styles.botCardSelected : ''}`}
                                        onClick={() => {
                                            if (isSelected) {
                                                setSelectedChatbots(selectedChatbots.filter(id => id !== bot.id))
                                            } else {
                                                setSelectedChatbots([...selectedChatbots, bot.id])
                                            }
                                        }}
                                    >
                                        <div className={styles.checkbox}>
                                            {isSelected && <Check size={14} color="#fff" strokeWidth={4} />}
                                        </div>
                                        <div className={styles.botInfo}>
                                            <div className={styles.botName}>{bot.name}</div>
                                            <div className={styles.botDate}>
                                                Bot ID: {bot.id.slice(0, 8)}... • {new Date(bot.created_at).toLocaleDateString('fr-FR')}
                                            </div>
                                        </div>
                                        {isSelected && <Trash size={18} color="#ef4444" />}
                                    </div>
                                )
                            })}
                        </div>

                        <div className={styles.modalActions}>
                            <button className={styles.cancelBtn} onClick={() => setShowDeleteModal(false)}>
                                Annuler
                            </button>
                            <button
                                className={styles.deleteConfirmBtn}
                                onClick={handleConfirmDeletion}
                                disabled={selectedChatbots.length < requiredDeletions}
                            >
                                {selectedChatbots.length < requiredDeletions
                                    ? `Sélectionnez ${requiredDeletions - selectedChatbots.length} de plus`
                                    : `Confirmer la suppression (${selectedChatbots.length})`
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
