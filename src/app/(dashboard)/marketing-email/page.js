'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Lock, Mail, Download, Search, Calendar, User, ArrowRight, Settings, Sparkles, X, Bot, Send } from 'lucide-react'
import Link from 'next/link'
import { PlanRestriction } from '@/components/ui/plan-restriction'
import styles from './page.module.css'
import EmailComposer from '@/components/dashboard/email-composer'
import aiStyles from './ai-modal.module.css'

export default function MarketingEmailPage() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [leads, setLeads] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [profile, setProfile] = useState(null) // Added missing state for profile
    const [chatbots, setChatbots] = useState([]) // Added missing state for chatbots
    const [selectedBot, setSelectedBot] = useState(null)
    const [editingEmail, setEditingEmail] = useState({
        subject: '',
        body: '',
        sender_name: '',
        reply_to: ''
    })
    const [saving, setSaving] = useState(false)
    const [sendingCampaign, setSendingCampaign] = useState(false)
    const [isComposerOpen, setIsComposerOpen] = useState(false)
    const [showAIModal, setShowAIModal] = useState(false)
    const [isAIPrompting, setIsAIPrompting] = useState(false)
    const [isChatExpanded, setIsChatExpanded] = useState(false)
    const [aiPrompt, setAiPrompt] = useState('')
    const [isGeneratingAI, setIsGeneratingAI] = useState(false)
    const [hasTeaserBeenShown, setHasTeaserBeenShown] = useState(false)
    const [chatMessages, setChatMessages] = useState([
        {
            role: 'assistant',
            content: "Bienvenue sur Vendo. ✨\n\nJe suis votre **Concierge IA**. Je peux vous présenter la puissance de notre plateforme ou **forger le System Prompt d'élite** pour votre futur chatbot.\n\nQuelle est votre mission aujourd'hui ?"
        }
    ])
    const composerRef = useRef(null)
    const isLocked = profile?.plan_tier === 'free' // Defined isLocked based on profile

    useEffect(() => {
        if (!user) return
        const fetchData = async () => {
            try {
                console.log('[MarketingEmail] Fetching data...');
                // Fetch profile
                const { data: prof, error: profError } = await supabase.from('profiles').select('plan_tier').eq('id', user.id).single()
                if (profError) console.error('[MarketingEmail] Profile error:', profError);
                setProfile(prof || { plan_tier: 'free' })

                // Fetch bots
                const { data: bots, error: botsError } = await supabase.from('chatbots').select('*').eq('user_id', user.id)
                if (botsError) console.error('[MarketingEmail] Bots error:', botsError);

                let currentBots = bots || []

                // Demo Data for Free Users
                if (currentBots.length === 0 && (prof?.plan_tier === 'free' || !prof)) {
                    currentBots = [{
                        id: 'demo-bot',
                        name: 'Assistant Démo',
                        collect_emails: true,
                        welcome_email_subject: 'Bienvenue chez nous !',
                        welcome_email_body: 'Bonjour, merci de votre intérêt...'
                    }]
                }

                setChatbots(currentBots)

                if (currentBots.length > 0) {
                    // Auto-select first bot
                    const initialBot = currentBots[0]
                    setSelectedBot(initialBot)
                    setEditingEmail({
                        subject: initialBot.welcome_email_subject || 'Merci de votre visite !',
                        body: initialBot.welcome_email_body || '',
                        sender_name: initialBot.custom_sender_name || '',
                        reply_to: initialBot.reply_to || ''
                    })

                    const botIds = currentBots.map(b => b.id).filter(id => id !== 'demo-bot')
                    let currentLeads = []

                    if (botIds.length > 0) {
                        const { data: leadData, error: leadsError } = await supabase
                            .from('leads')
                            .select('*')
                            .in('chatbot_id', botIds)
                            .order('captured_at', { ascending: false })

                        if (leadsError) console.error('[MarketingEmail] Leads error:', leadsError);
                        currentLeads = leadData || []
                    }

                    // Add demo leads if empty
                    if (currentLeads.length === 0 && (prof?.plan_tier === 'free' || !prof)) {
                        currentLeads = [
                            { id: 'l1', email: 'jean.doe@exemple.fr', captured_at: new Date().toISOString(), source_page: '/demo' },
                            { id: 'l2', email: 'marie.lucas@test.com', captured_at: new Date(Date.now() - 86400000).toISOString(), source_page: '/contact' }
                        ]
                    }
                    setLeads(currentLeads)
                }

                console.log('[MarketingEmail] Data fetch complete.');
            } catch (err) {
                console.error('[MarketingEmail] Critical fetch error:', err);
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [user])

    useEffect(() => {
        if (isComposerOpen && composerRef.current) {
            setTimeout(() => {
                composerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 100)
        }
    }, [isComposerOpen])

    // AI Draft Sync
    useEffect(() => {
        const handleAIResponse = (e) => {
            if (e.detail?.content) {
                let fullContent = e.detail.content

                // Strip markdown code blocks
                if (fullContent.includes('```')) {
                    const match = fullContent.match(/```(?:html|text|markdown)?([\s\S]*?)```/)
                    if (match) fullContent = match[1].trim()
                }

                let subject = ''
                let body = fullContent

                // Extract Subject (looks for "Objet :" or "**Objet :**")
                const subjectRegex = /(?:\*\*?)?Objet\s*:\s*(.*?)(?:\*\*?)?\n/i
                const subjectMatch = fullContent.match(subjectRegex)

                if (subjectMatch) {
                    subject = subjectMatch[1].trim()
                    // Remove the subject line from the body
                    body = fullContent.replace(subjectRegex, '').trim()

                    // Also remove any leading intro text if the AI said "Voici l'email..."
                    if (body.includes('\n')) {
                        const lines = body.split('\n')
                        // If the first lines are an intro before the actual greeting
                        if (lines[0].toLowerCase().includes('voici') || lines[0].toLowerCase().includes('parfait')) {
                            body = lines.slice(1).join('\n').trim()
                        }
                    }
                }

                setEditingEmail(prev => ({
                    subject: subject || prev.subject,
                    body: body
                }))
            }
        }

    }, [])

    // Marketing Email AI Modal Auto-dismiss (5 seconds)
    useEffect(() => {
        if (!showAIModal || isChatExpanded || isAIPrompting) return

        const timer = setTimeout(() => {
            setShowAIModal(false)
        }, 5000)

        return () => clearTimeout(timer)
    }, [showAIModal, isChatExpanded, isAIPrompting])

    const toggleEmailCollection = async (botId, currentStatus) => {
        if (isLocked) {
            alert('Cette option est réservée aux membres Pro. (Mode Démo)')
            return
        }

        const { error } = await supabase
            .from('chatbots')
            .update({ collect_emails: !currentStatus })
            .eq('id', botId)

        if (error) {
            alert('Erreur: ' + error.message)
        } else {
            setChatbots(chatbots.map(b => b.id === botId ? { ...b, collect_emails: !currentStatus } : b))
        }
    }

    const saveEmailTemplate = async () => {
        if (isLocked) {
            alert('Réglages sauvegardés ! (Mode Démo - Plan Pro requis)')
            return
        }

        if (!selectedBot) return
        if (editingEmail.reply_to) {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
            if (!emailRegex.test(editingEmail.reply_to.trim())) {
                alert("Veuillez entrer une adresse email de réponse valide (ex: contact@domaine.com)")
                return
            }
        }

        setSaving(true)
        const { error } = await supabase
            .from('chatbots')
            .update({
                welcome_email_subject: editingEmail.subject,
                welcome_email_body: editingEmail.body,
                custom_sender_name: editingEmail.sender_name,
                reply_to: editingEmail.reply_to?.trim()
            })
            .eq('id', selectedBot.id)

        if (error) {
            alert('Erreur: ' + error.message)
        } else {
            setChatbots(chatbots.map(b => b.id === selectedBot.id ? {
                ...b,
                welcome_email_subject: editingEmail.subject,
                welcome_email_body: editingEmail.body,
                custom_sender_name: editingEmail.sender_name,
                reply_to: editingEmail.reply_to
            } : b))
            alert('Template sauvegardé !')
        }
        setSaving(false)
    }

    const selectBotForEditing = (bot) => {
        setSelectedBot(bot)
        setEditingEmail({
            subject: bot.welcome_email_subject || 'Merci de votre visite !',
            body: bot.welcome_email_body || '',
            sender_name: bot.custom_sender_name || '',
            reply_to: bot.reply_to || ''
        })
    }

    const sendBulkCampaignFromComposer = async ({ subject, body }) => {
        if (isLocked) {
            alert("L'envoi de campagnes est réservé aux membres Pro. Votre email est prêt, mais l'envoi est désactivé en mode démo.")
            return
        }
        if (!subject || !body) return alert('Sujet et message requis.')
        if (!confirm(`Êtes-vous sûr de vouloir envoyer cet email à ${leads.length} contacts ?`)) return

        setSendingCampaign(true)
        try {
            const res = await fetch('/api/send-campaign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    subject: subject,
                    body: body
                })
            })
            const data = await res.json()
            if (data.success) {
                alert(`Campagne traitée :\n- ${data.totalLeads} leads trouvés\n- ${data.sentCount} envoyés\n- ${data.failCount} échecs`)
                setIsComposerOpen(false)
            } else {
                alert('Erreur: ' + data.error)
            }
        } catch (err) {
            alert('Erreur lors de l\'envoi de la campagne.')
        }
        setSendingCampaign(false)
    }

    const generateEmailWithAI = async (customPrompt) => {
        const promptToUse = customPrompt || aiPrompt
        if (!promptToUse.trim()) return

        const userMsg = { role: 'user', content: promptToUse }
        setChatMessages(prev => [...prev, userMsg])
        setAiPrompt('')

        setIsGeneratingAI(true)
        setIsChatExpanded(true)

        if (isLocked) {
            await new Promise(resolve => setTimeout(resolve, 1500))
            const assistantMsg = {
                role: 'assistant',
                content: "J'ai préparé un brouillon d'email expert pour vous ! (Mode Démo).\n\nComme vous êtes sur le plan gratuit, j'ai utilisé un modèle standard. Le plan Pro permet une génération 100% personnalisée adaptée à vos produits."
            }
            setChatMessages(prev => [...prev, assistantMsg])
            setEditingEmail(prev => ({
                ...prev,
                subject: "Bienvenue chez nous ! (Brouillon Démo)",
                body: "Bonjour,\n\nCeci est un exemple d'email généré par l'IA Vendo.\n\nEn passant au plan Pro, je pourrai analyser vos produits et votre ton pour créer des emails qui convertissent vraiment vos leads.\n\nÀ bientôt !"
            }))
            setIsComposerOpen(true)
            setIsGeneratingAI(false)
            return
        }

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: 'Tu es un expert en marketing digital. Rédige un email professionnel basé sur la demande de l\'utilisateur. Réponds EXCLUSIVEMENT sous format JSON avec les clés "subject" et "body" (le body doit être du HTML propre).' },
                        ...chatMessages,
                        userMsg
                    ],
                    chatbotId: 'VENDO_SUPPORT'
                })
            })

            const data = await response.json()
            if (data.content) {
                setChatMessages(prev => [...prev, { role: 'assistant', content: data.content }])
                try {
                    const result = JSON.parse(data.content.replace(/```json|```/g, '').trim())
                    setEditingEmail({
                        subject: result.subject || '',
                        body: result.body || ''
                    })
                    setIsComposerOpen(true)
                } catch (e) {
                    console.log('AI response was not JSON')
                }
            }
        } catch (error) {
            console.error('AI Generation error:', error)
        } finally {
            setIsGeneratingAI(false)
        }
    }

    const sendBulkCampaign = async () => {
        // Legacy support
    }


    if (loading) return <div style={{ padding: 24 }}>Chargement...</div>

    const filteredLeads = leads.filter(l =>
        l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.source_page?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.heading}>Marketing Email</h1>
                    <p className={styles.subheading}>Gérez vos contacts et automatisez vos séquences.</p>
                </div>
                <div className={styles.headerActions}>
                    <Button
                        onClick={() => {
                            setIsComposerOpen(true)
                            if (!hasTeaserBeenShown) {
                                setShowAIModal(true)
                                setHasTeaserBeenShown(true)
                            }
                        }}
                        className={styles.composeBtn}
                    >
                        <Mail size={16} style={{ marginRight: 8 }} /> Nouvelle Campagne
                    </Button>
                </div>
            </div>

            <div style={{ position: 'relative' }}>
                {isLocked && (
                    <PlanRestriction
                        tier="Pro"
                        description="Capturez les emails de vos visiteurs et transformez-les en clients avec des séquences automatiques. Réservé aux membres <strong>Pro</strong>."
                        isOverlay={false}
                    />
                )}
                <div className={styles.grid} style={{ pointerEvents: 'auto', opacity: 1 }}>
                    {/* Left: Bot Settings */}
                    <div className={styles.sidebar}>
                        <div className={styles.card}>
                            <div className={styles.cardTitle}>
                                <Settings size={18} style={{ marginRight: 8 }} /> Configuration
                            </div>
                            <p className={styles.cardDescription}>
                                Activez la capture pour chaque assistant.
                            </p>

                            <div className={styles.botList}>
                                {chatbots.map(bot => (
                                    <div
                                        key={bot.id}
                                        className={`${styles.botItem} ${selectedBot?.id === bot.id ? styles.botItemSelected : ''}`}
                                        onClick={() => selectBotForEditing(bot)}
                                        style={{ cursor: 'pointer', marginBottom: 12 }}
                                    >
                                        <div className={styles.botInfo} style={{ flex: 1 }}>
                                            <div className={styles.botItemName} style={{ fontWeight: 800, fontSize: 15, color: '#fff', marginBottom: 2 }}>{bot.name}</div>
                                            <div className={bot.collect_emails ? styles.statusActive : styles.statusInactive} style={{ fontSize: 12, fontWeight: 600 }}>
                                                {bot.collect_emails ? 'Capture active' : 'Inactif'}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <label className={styles.switch}>
                                                <input
                                                    type="checkbox"
                                                    checked={!!bot.collect_emails}
                                                    onChange={() => toggleEmailCollection(bot.id, bot.collect_emails)}
                                                />
                                                <span className={styles.slider}></span>
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.card} style={{ marginTop: 24 }}>
                            <div className={styles.cardTitle}>
                                <Settings size={18} style={{ marginRight: 8 }} /> Personnalisation Email
                            </div>

                            <div className={styles.formGroup} style={{ marginTop: 16 }}>
                                <label className={styles.label}>Nom de l'expéditeur</label>
                                <Input
                                    value={editingEmail.sender_name}
                                    onChange={(e) => setEditingEmail({ ...editingEmail, sender_name: e.target.value })}
                                    placeholder="Ex: Thomas de Vendo"
                                />
                                <p style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.3)', marginTop: 6, fontWeight: 500 }}>
                                    Nom qui apparaîtra dans la boîte mail du client.
                                </p>
                            </div>

                            <div className={styles.formGroup} style={{ marginTop: 20 }}>
                                <label className={styles.label}>Email de réponse (Reply-to)</label>
                                <Input
                                    value={editingEmail.reply_to}
                                    onChange={(e) => setEditingEmail({ ...editingEmail, reply_to: e.target.value })}
                                    placeholder="Ex: contact@ma-marque.com"
                                    type="email"
                                    pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                                    title="Veuillez entrer une adresse email valide (ex: utilisateur@domaine.com)"
                                />
                                <p style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.3)', marginTop: 6, fontWeight: 500 }}>
                                    Les réponses des clients iront sur cette adresse.
                                </p>
                            </div>

                            <Button
                                className={styles.saveBtn}
                                onClick={saveEmailTemplate}
                                disabled={saving}
                                style={{ marginTop: 20, width: '100%' }}
                            >
                                {saving ? 'Enregistrement...' : 'Sauvegarder les réglages'}
                            </Button>
                        </div>
                    </div>

                    {/* Right: Leads Table */}
                    <div className={styles.mainContent}>
                        <div>
                            <div className={styles.card}>
                                <div className={styles.tableHeader}>
                                    <div className={styles.tableTitle}>CONTACTS RÉCOLTÉS ({leads.length})</div>
                                    <div className={styles.searchBar}>
                                        <Search size={16} />
                                        <input
                                            type="text"
                                            placeholder="Rechercher un email..."
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
                                                    <th>SOURCE / PAGE</th>
                                                    <th>DATE</th>
                                                    <th>ACTIONS</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredLeads.map((lead) => (
                                                    <tr key={lead.id}>
                                                        <td>
                                                            <div className={styles.leadEmail}>{lead.email}</div>
                                                            <div className={styles.leadVisitor}>Visiteur ID: {lead.visitor_id?.substring(0, 8)}...</div>
                                                        </td>
                                                        <td>
                                                            <div className={styles.leadSource}>
                                                                {lead.source_page ? (
                                                                    <a href={lead.source_page} target="_blank" rel="noreferrer">
                                                                        {lead.source_page.split('/').pop() || 'Accueil'}
                                                                    </a>
                                                                ) : 'Direct'}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className={styles.leadDate} style={{ fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.6)' }}>
                                                                <Calendar size={14} style={{ marginRight: 8, opacity: 0.5 }} />
                                                                {new Date(lead.captured_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
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
                                            <Mail size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
                                            <p>Aucun email récolté pour le moment.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {isComposerOpen && (
                                <div ref={composerRef} className={styles.card} style={{ marginTop: 32 }}>
                                    <EmailComposer
                                        isOpen={true}
                                        onClose={() => setIsComposerOpen(false)}
                                        onSend={sendBulkCampaignFromComposer}
                                        leadsCount={leads.length}
                                        initialSubject={editingEmail.subject}
                                        initialBody={editingEmail.body}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Assistant Modal */}
            {showAIModal && (
                <>
                    <style jsx global>{`
                        .vendo-invite-card {
                            display: none !important;
                        }
                        ${isChatExpanded ? `
                        .vendo-toggle-btn {
                            display: none !important;
                        }
                        ` : ''}
                    `}</style>
                    <div className={aiStyles.container}>
                        <div className={`${aiStyles.modal} ${isChatExpanded ? aiStyles.fullWindow : ''}`}>
                            {/* Header (Full Window Only) */}
                            {isChatExpanded ? (
                                <div className={aiStyles.header}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 1 }}>
                                        <div className={aiStyles.headerIcon}>
                                            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 22, color: 'white' }}>V</span>
                                        </div>
                                        <div className={aiStyles.headerInfo}>
                                            <div className={aiStyles.headerName}>Assistant Vendo</div>
                                            <div className={aiStyles.headerStatus}>
                                                <div className={aiStyles.onlineDot}></div>
                                                <span className={aiStyles.statusLabel}>EXPERT VENDO CONNECTÉ</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className={aiStyles.closeBtn} onClick={() => {
                                        setShowAIModal(false)
                                        setIsChatExpanded(false)
                                        setIsAIPrompting(false)
                                    }}>
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <button className={`${aiStyles.closeBtn} ${aiStyles.closeBtnAbsolute}`} onClick={() => {
                                    setShowAIModal(false)
                                    setIsAIPrompting(false)
                                }}>
                                    <X size={18} />
                                </button>
                            )}

                            {/* Messages / Teaser Content */}
                            {isChatExpanded ? (
                                <div className={aiStyles.messages}>
                                    {chatMessages.map((msg, i) => (
                                        <div key={i} className={aiStyles.messageBubble} style={{
                                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                            background: msg.role === 'user' ? '#673DE6' : '#1E293B',
                                            borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                            border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                            boxShadow: msg.role === 'user' ? '0 8px 16px rgba(103, 61, 230, 0.2)' : '0 2px 8px rgba(0,0,0,0.2)'
                                        }}>
                                            {msg.content}
                                        </div>
                                    ))}
                                    {isGeneratingAI && (
                                        <div className={aiStyles.messageBubble} style={{ opacity: 0.7 }}>
                                            Génération en cours...
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className={aiStyles.cardBody}>
                                    <div className={aiStyles.avatarWrapper}>
                                        <div className={aiStyles.avatar}>
                                            <Bot size={26} />
                                        </div>
                                        <div style={{ position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, background: '#10B981', border: '3px solid #0f172a', borderRadius: '50%' }}></div>
                                    </div>

                                    <div className={aiStyles.content}>
                                        <div style={{ fontSize: 13, fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Assistant Vendo</div>
                                        <div className={aiStyles.title}>
                                            {isAIPrompting ? "Que souhaitez-vous écrire ?" : "Je peux rédiger cet email pour vous en quelques secondes."}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Input Area (Bottom) */}
                            {isChatExpanded || isAIPrompting ? (
                                <div className={aiStyles.promptArea}>
                                    <input
                                        autoFocus
                                        className={aiStyles.promptInput}
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                        placeholder={isChatExpanded ? "Posez une question à Vendo..." : "Décrivez votre email..."}
                                        onKeyPress={(e) => e.key === 'Enter' && generateEmailWithAI()}
                                    />
                                    <button
                                        className={aiStyles.sendPromptBtn}
                                        onClick={() => generateEmailWithAI()}
                                        disabled={isGeneratingAI || !aiPrompt.trim()}
                                    >
                                        {isGeneratingAI ? <Sparkles className={aiStyles.spin} size={20} /> : <Send size={20} />}
                                    </button>
                                </div>
                            ) : (
                                <div className={aiStyles.footer}>
                                    <span className={aiStyles.time}>Maintenant</span>
                                    <div className={aiStyles.actions}>
                                        <button
                                            className={aiStyles.primaryBtn}
                                            onClick={() => {
                                                setShowAIModal(false)
                                                window.dispatchEvent(new CustomEvent('vendo-assistant-open', {
                                                    detail: {
                                                        messages: [
                                                            { role: 'assistant', content: "Bonjour ! Je suis votre **Concierge IA**. Je peux rédiger votre campagne email.\n\nDécrivez-moi le but de votre email. Je commencerai par définir l'**Objet** puis je rédigerai le contenu, qui s'afficheront directement dans l'éditeur à gauche. ✨", shouldType: false }
                                                        ]
                                                    }
                                                }))
                                            }}
                                        >
                                            Répondre <Send size={12} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
