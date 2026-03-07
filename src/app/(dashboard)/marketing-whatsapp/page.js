'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Lock, Phone, MessageSquare, ShieldCheck, Search, Calendar, Settings, ArrowRight, Play, Eye, EyeOff, X, Send, Mail, Bot, Sparkles } from 'lucide-react'
import { PlanRestriction } from '@/components/ui/plan-restriction'
import WhatsAppComposer from '@/components/dashboard/whatsapp-composer'
import styles from './page.module.css'

export default function MarketingWhatsAppPage() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState(null)
    const [leads, setLeads] = useState([])
    const [chatbots, setChatbots] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedBot, setSelectedBot] = useState(null)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        phone: '',
        accountId: '',
        token: ''
    })
    const [showToken, setShowToken] = useState(false)
    const composerRef = useRef(null)

    // Campaign Stats
    const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false)
    const [campaignMessage, setCampaignMessage] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [hasTeaserBeenShown, setHasTeaserBeenShown] = useState(false)

    // Listen for AI Suggestions from Global Assistant
    useEffect(() => {
        const handleAISuggestion = (e) => {
            if (e.detail?.content) {
                // Extract message between quotes if present, otherwise use full content
                const content = e.detail.content
                const extracted = content.split('"')[1] || content
                setCampaignMessage(extracted)
                setIsCampaignModalOpen(true)
            }
        }

        window.addEventListener('vendo-assistant-copy-to-whatsapp', handleAISuggestion)
        return () => window.removeEventListener('vendo-assistant-copy-to-whatsapp', handleAISuggestion)
    }, [])

    // Scroll to composer when opened
    useEffect(() => {
        if (isCampaignModalOpen && composerRef.current) {
            setTimeout(() => {
                composerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 100)
        }
    }, [isCampaignModalOpen])

    useEffect(() => {
        if (!user) return

        const fetchData = async () => {
            try {
                // 1. Check Plan
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                const currentProfile = profileData || { plan_tier: 'free' }
                setProfile(currentProfile)

                if (profileData) {
                    setFormData({
                        phone: profileData.whatsapp_phone_id || '',
                        accountId: profileData.whatsapp_waba_id || '',
                        token: profileData.whatsapp_access_token || ''
                    })
                }

                // 2. Fetch Chatbots (Visible for everyone)
                const { data: botsData } = await supabase
                    .from('chatbots')
                    .select('*')
                    .eq('user_id', user.id)

                const currentBots = botsData || []
                setChatbots(currentBots)
                if (currentBots.length > 0) setSelectedBot(currentBots[0])

                // Skip leads if not agency
                if (currentProfile?.plan_tier !== 'agency') {
                    setLoading(false)
                    return
                }

                // 3. Fetch Collected Phone Numbers (Leads)
                const { data: leadsData } = await supabase
                    .from('leads')
                    .select('*, chatbots(name)')
                    .not('phone', 'is', null)
                    .order('captured_at', { ascending: false })

                setLeads(leadsData || [])
            } catch (err) {
                console.error('Error fetching WhatsApp data:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user])

    const handleSaveConfig = async () => {
        if (profile?.plan_tier !== 'agency') {
            alert('Cette fonctionnalité est réservée aux comptes Agence.')
            return
        }
        setIsSaving(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    whatsapp_phone_id: formData.phone,
                    whatsapp_waba_id: formData.accountId,
                    whatsapp_access_token: formData.token
                })
                .eq('id', user.id)

            if (error) throw error
            alert('Configuration sauvegardée avec succès !')
        } catch (err) {
            console.error('Error saving WhatsApp config:', err)
            alert('Erreur lors de la sauvegarde: ' + err.message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleSendCampaign = async () => {
        if (!campaignMessage.trim()) {
            alert('Veuillez saisir un message.')
            return
        }

        if (leads.length === 0) {
            alert('Aucun contact disponible pour l\'envoi.')
            return
        }

        if (!formData.token || !formData.phone) {
            alert('Veuillez configurer l\'API Meta avant d\'envoyer une campagne.')
            return
        }

        setIsSending(true)
        try {
            // Here we would iterate through leads and call WhatsApp Cloud API
            // Simulation of sending
            await new Promise(resolve => setTimeout(resolve, 2000))

            alert(`Campagne envoyée avec succès à ${leads.length} contacts !`)
            setIsCampaignModalOpen(false)
            setCampaignMessage('')
        } catch (err) {
            console.error('Error sending campaign:', err)
            alert('Erreur lors de l\'envoi : ' + err.message)
        } finally {
            setIsSending(false)
        }
    }

    const togglePhoneCollection = async (botId, currentStatus) => {
        if (profile?.plan_tier !== 'agency' && process.env.NODE_ENV !== 'development') {
            alert('Cette option est réservée aux membres Agence. (Mode Démo)')
            return
        }

        const { error } = await supabase
            .from('chatbots')
            .update({ collect_phones: !currentStatus })
            .eq('id', botId)

        if (error) {
            alert('Erreur: ' + error.message)
        } else {
            setChatbots(chatbots.map(b => b.id === botId ? { ...b, collect_phones: !currentStatus } : b))
        }
    }

    if (loading) return <div style={{ padding: 40 }}>Chargement...</div>

    const isLocked = profile?.plan_tier !== 'agency'
    const filteredLeads = leads.filter(l =>
        (l.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (l.chatbots?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.heading}>Marketing WhatsApp</h1>
                    <p className={styles.subheading}>Gérez vos contacts et automatisez vos messages WhatsApp.</p>
                </div>
                <div className={styles.headerActions}>
                    <Button
                        onClick={() => {
                            setIsCampaignModalOpen(true)
                            if (!hasTeaserBeenShown) {
                                window.dispatchEvent(new CustomEvent('vendo-proactive-trigger', {
                                    detail: { message: "Besoin d'un message WhatsApp impactant ? Décrivez-moi votre objectif." }
                                }))
                                setHasTeaserBeenShown(true)
                            }
                        }}
                        className={styles.composeBtn}
                    >
                        <MessageSquare size={16} style={{ marginRight: 8 }} /> Nouvelle Campagne
                    </Button>
                </div>
            </div>

            <div style={{ position: 'relative' }}>
                {isLocked && (
                    <PlanRestriction
                        tier="Agence"
                        description="Gérez vos contacts et automatisez vos messages WhatsApp. Réservé aux comptes <strong>Agence</strong>."
                        isOverlay={false}
                    />
                )}
                <div className={styles.grid}>
                    {/* Left: Bot Settings */}
                    <div className={styles.sidebar}>
                        <div className={styles.card}>
                            <div className={styles.cardTitle}>
                                <Settings size={18} style={{ marginRight: 8 }} /> Configuration
                            </div>
                            <p className={styles.cardDescription}>
                                Activez la capture WhatsApp pour vos bots.
                            </p>

                            <div className={styles.botList}>
                                {chatbots.map(bot => (
                                    <div
                                        key={bot.id}
                                        className={`${styles.botItem} ${selectedBot?.id === bot.id ? styles.botItemSelected : ''}`}
                                        onClick={() => setSelectedBot(bot)}
                                    >
                                        <div className={styles.botInfo} style={{ flex: 1 }}>
                                            <div className={styles.botItemName}>{bot.name || 'Assistant Vendo'}</div>
                                            <div className={bot.collect_phones ? styles.statusActive : styles.statusInactive}>
                                                {bot.collect_phones ? 'Capture active' : 'Inactif'}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <label className={styles.switch}>
                                                <input
                                                    type="checkbox"
                                                    checked={!!bot.collect_phones}
                                                    onChange={(e) => {
                                                        e.stopPropagation()
                                                        togglePhoneCollection(bot.id, bot.collect_phones)
                                                    }}
                                                />
                                                <span className={styles.slider}></span>
                                            </label>
                                        </div>
                                    </div>
                                ))}
                                {chatbots.length === 0 && (
                                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '20px 0' }}>
                                        Aucun chatbot trouvé.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Main Content Area */}
                    <div className={styles.mainContent}>
                        <div className={styles.card}>
                            <div className={styles.tableHeader}>
                                <div className={styles.tableTitle}>CONTACTS RÉCOLTÉS ({leads.length})</div>
                                <div className={styles.searchBar}>
                                    <Search size={16} />
                                    <input
                                        type="text"
                                        placeholder="Rechercher..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className={styles.tableContainer}>
                                {filteredLeads.length > 0 ? (
                                    <table className={styles.table}>
                                        <thead>
                                            <tr>
                                                <th>CONTACT</th>
                                                <th>SOURCE / BOT</th>
                                                <th>DATE</th>
                                                <th>ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredLeads.map((lead) => (
                                                <tr key={lead.id}>
                                                    <td>
                                                        <div className={styles.leadEmail}>{lead.phone}</div>
                                                        <div className={styles.leadVisitor}>ID: {lead.visitor_id?.substring(0, 8)}</div>
                                                    </td>
                                                    <td>
                                                        <div className={styles.leadSource}>
                                                            {lead.chatbots?.name || 'Inconnu'}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className={styles.leadDate}>
                                                            <Calendar size={14} style={{ marginRight: 8, opacity: 0.5 }} />
                                                            {new Date(lead.captured_at || lead.created_at).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <Button variant="ghost" size="sm">
                                                            <ArrowRight size={14} />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className={styles.emptyState}>
                                        <Phone size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
                                        <p>Aucun numéro récolté pour le moment.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* API Meta Section */}
                        <div className={styles.card} style={{ marginTop: 32 }}>
                            <div className={styles.cardTitle} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <ShieldCheck size={18} style={{ marginRight: 8 }} /> Configuration API Meta
                                </div>
                                <button onClick={(e) => e.preventDefault()} className={styles.tutoBtn}>
                                    <Play size={14} fill="#7c3aed" color="#7c3aed" /> <span>Voir le tuto</span>
                                </button>
                            </div>
                            <p className={styles.cardDescription} style={{ marginBottom: 24 }}>
                                Connectez votre compte WhatsApp Business API pour automatiser vos campagnes.
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Numéro Business (ID)</label>
                                    <Input
                                        placeholder="1059382..."
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        style={{ height: 44, borderRadius: 12 }}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>ID Compte WhatsApp</label>
                                    <Input
                                        placeholder="9328472..."
                                        value={formData.accountId}
                                        onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                                        style={{ height: 44, borderRadius: 12 }}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup} style={{ marginTop: 8, maxWidth: '600px' }}>
                                <label className={styles.label}>Token d'accès</label>
                                <div style={{ position: 'relative' }}>
                                    <Input
                                        type={showToken ? 'text' : 'password'}
                                        placeholder="EAAGz..."
                                        value={formData.token}
                                        onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                                        style={{ height: 44, borderRadius: 12, paddingRight: 48 }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowToken(!showToken)}
                                        style={{
                                            position: 'absolute',
                                            right: 12,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            color: 'rgba(255, 255, 255, 0.4)',
                                            cursor: 'pointer',
                                            padding: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            zIndex: 5
                                        }}
                                    >
                                        {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                                <Button
                                    className={styles.saveBtn}
                                    onClick={handleSaveConfig}
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                                </Button>
                            </div>
                        </div>

                        <div className={styles.infoBox} style={{ marginTop: 24 }}>
                            Note : L'envoi de messages WhatsApp via l'API Meta peut engendrer des coûts supplémentaires par conversation.
                        </div>

                        {isCampaignModalOpen && (
                            <div ref={composerRef} className={styles.card} style={{ marginTop: 32, padding: 0, overflow: 'hidden' }}>
                                <WhatsAppComposer
                                    isOpen={true}
                                    onClose={() => setIsCampaignModalOpen(false)}
                                    onSend={async (msg) => {
                                        setCampaignMessage(msg)
                                        await handleSendCampaign()
                                    }}
                                    leadsCount={leads.length}
                                    phoneId={formData.phone}
                                    initialMessage={campaignMessage}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
