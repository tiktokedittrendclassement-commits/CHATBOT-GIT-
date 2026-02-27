
'use client'

import { useState, useEffect } from 'react'
import { getContrastColor } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { PlanRestriction } from '@/components/ui/plan-restriction'
import styles from './editor.module.css'
import { ArrowLeft, Save, Bot, Lock, Clock, ArrowDown, Trash2, Plus, Zap, MousePointer2, Percent, Palette, Code, MessageSquare, Settings } from 'lucide-react'

// ... (existing code) ...



// This component handles both Creating and Editing
export default function ChatbotEditor({ botId = null }) {
    const { user } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(!!botId)

    const [formData, setFormData] = useState({
        name: '',
        subtitle: 'En ligne · repond en 3s',
        color: '#673DE6',
        logo_url: 'ICON:BOT',
        welcome_message_new: 'Bonjour ! 👋 Comment puis-je vous aider aujourd\'hui ?',
        welcome_message_returning: 'Re-bonjour ! Ravi de vous revoir. 👋',
        system_prompt: 'Tu es un assistant commercial humain, chaleureux et direct. Réponds de manière concise, sans utiliser de formatage complexe (pas d\'astérisques). Ta mission est d\'aider le visiteur avec bienveillance.',
        data_sources: '',
        triggers: [],
        theme: 'light',
        sender_name: '',
        reply_to: ''
    })

    const PLAN_LIMITS = {
        free: 1,
        pro: 10,
        agency: 999999 // Unlimited
    }

    const [profile, setProfile] = useState(null)
    const [canCreate, setCanCreate] = useState(true)

    const handleFileUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (file.size > 2 * 1024 * 1024) {
            alert("L'image est trop lourde (Max 2MB).")
            return
        }

        setUploading(true)
        const uploadData = new FormData()
        uploadData.append('file', file)

        try {
            // Client-side upload (uses existing session)
            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}-${Date.now()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('logos')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('logos')
                .getPublicUrl(filePath)

            setFormData(prev => ({ ...prev, logo_url: publicUrl }))
        } catch (err) {
            console.error(err)
            alert(`Erreur upload: ${err.message}`)
        } finally {
            setUploading(false)
        }
    }

    // Initializer
    useEffect(() => {
        if (!user) return

        const init = async () => {
            const { data: prof } = await supabase.from('profiles').select('plan_tier').eq('id', user.id).single()
            const userPlan = prof?.plan_tier || 'free'
            setProfile(prof || { plan_tier: 'free' })

            if (!botId && userPlan === 'free') {
                setFormData(prev => ({ ...prev, logo_url: 'ICON:BOT' }))
            }

            if (!botId) {
                const { count } = await supabase.from('chatbots').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
                const limit = PLAN_LIMITS[prof?.plan_tier || 'free']
                if (count >= limit) {
                    setCanCreate(false)
                }
            }

            if (botId) {
                const { data, error } = await supabase
                    .from('chatbots')
                    .select('*')
                    .eq('id', botId)
                    .eq('user_id', user.id)
                    .single()

                if (data) {
                    setFormData({
                        name: userPlan === 'free' ? 'Mon Assistant Vendo' : data.name,
                        subtitle: data.subtitle ?? 'En ligne · repond en 3s',
                        color: data.color,
                        logo_url: data.logo_url || '',
                        welcome_message_new: data.welcome_message_new ?? 'Bonjour ! 👋 Comment puis-je vous aider aujourd\'hui ?',
                        welcome_message_returning: data.welcome_message_returning ?? 'Re-bonjour ! Ravi de vous revoir. 👋',
                        system_prompt: data.system_prompt,
                        data_sources: data.data_sources || '',
                        triggers: data.triggers?.map(t => ({ ...t, id: t.id || Math.random().toString(36).substr(2, 9) })) || [],
                        theme: data.theme || 'light',
                        sender_name: data.sender_name || '',
                        reply_to: data.reply_to || ''
                    })
                }
            } else if (userPlan === 'free') {
                setFormData(prev => ({ ...prev, name: 'Mon Assistant Vendo' }))
            }
            setFetching(false)
        }

        init()
    }, [botId, user?.id])

    // Proactive trigger for Vendo Assistant
    useEffect(() => {
        if (!botId) {
            const timer = setTimeout(() => {
                window.dispatchEvent(new CustomEvent('vendo-proactive-trigger', {
                    detail: {
                        message: "Si tu veux que je crée ton sytem prompt ou t'as data je suis là"
                    }
                }))
            }, 800)
            return () => clearTimeout(timer)
        }
    }, [botId])

    // Helper to manage triggers array state
    const updateTrigger = (id, updates) => {
        setFormData(prev => ({
            ...prev,
            triggers: prev.triggers.map(t => t.id === id ? { ...t, ...updates } : t)
        }))
    }

    const addTrigger = () => {
        const newTrigger = {
            id: Date.now().toString(),
            type: 'time',
            spawn: '2',
            despawn: '8',
            message: 'Bonjour ! 👋',
            page: '',
            oncePerUser: false
        }
        setFormData(prev => ({
            ...prev,
            triggers: [...(prev.triggers || []), newTrigger]
        }))
    }

    const removeTrigger = (id) => {
        setFormData(prev => ({
            ...prev,
            triggers: prev.triggers.filter(t => t.id !== id)
        }))
    }

    const triggers = formData.triggers || []

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!botId && !canCreate) {
            alert(`You have reached the limit of ${PLAN_LIMITS[profile?.plan_tier || 'free']} chatbots for your plan. Please upgrade.`)
            return
        }

        if (formData.reply_to) {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
            if (!emailRegex.test(formData.reply_to.trim())) {
                alert("Veuillez entrer une adresse email de réponse valide (ex: contact@domaine.com)")
                return
            }
        }

        setLoading(true)

        try {
            // Safety: Ensure profile exists before save
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', user.id)
                .single()

            if (!existingProfile) {
                console.log('Safety check: Profile missing in editor, creating now...')
                const { error: createError } = await supabase
                    .from('profiles')
                    .insert({
                        id: user.id,
                        email: user.email,
                        full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.given_name || 'Membre'
                    })
                if (createError) throw new Error('Impossible de créer votre profil utilisateur : ' + createError.message)
            }

            console.log('Saving chatbot payload:', formData); // Debug log
            const payload = {
                name: isFreePlan ? 'Mon Assistant Vendo' : formData.name,
                subtitle: formData.subtitle,
                color: formData.color,
                logo_url: formData.logo_url,
                welcome_message_new: formData.welcome_message_new,
                welcome_message_returning: formData.welcome_message_returning,
                system_prompt: formData.system_prompt,
                data_sources: formData.data_sources,
                triggers: formData.triggers,
                theme: formData.theme,
                sender_name: formData.sender_name,
                reply_to: formData.reply_to?.trim()
            }

            if (botId) {
                const { error } = await supabase
                    .from('chatbots')
                    .update({ ...payload, updated_at: new Date() })
                    .eq('id', botId)
                    .eq('user_id', user.id)

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('chatbots')
                    .insert({ user_id: user.id, ...payload })

                if (error) throw error
            }

            router.push('/chatbots')
            router.refresh()
        } catch (error) {
            if (error.name === 'AbortError') return;
            alert('Error saving chatbot: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const isFreePlan = profile?.plan_tier === 'free' || !profile?.plan_tier

    if (fetching) return <div className={styles.loading}>Chargement de l&apos;éditeur...</div>

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <Link href="/chatbots" className={styles.backLink}>
                        <ArrowLeft size={20} />
                        Retour
                    </Link>
                    <h1 className={styles.title}>{botId ? 'Modifier Chatbot' : 'Nouveau Chatbot'}</h1>
                </div>

                {!botId && !canCreate ? (
                    <Link href="/billing">
                        <Button variant="destructive" className="w-full">
                            Limite Atteinte (Mettre à niveau)
                        </Button>
                    </Link>
                ) : (
                    <div style={{ display: 'flex', gap: 8 }}>

                        <Button onClick={handleSubmit} disabled={loading} size="md">
                            <Save size={16} style={{ marginRight: 8 }} />
                            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                        </Button>
                    </div>
                )}
            </div>

            {!botId && !canCreate && (
                <PlanRestriction
                    tier={profile?.plan_tier === 'free' ? 'Pro' : 'Agence'}
                    description={`Vous avez atteint la limite de ${PLAN_LIMITS[profile?.plan_tier || 'free']} chatbot(s) pour votre plan actuel. Veuillez mettre à niveau pour en créer d'autres.`}
                />
            )}

            <div className={styles.grid}>
                <div className={styles.mainCol}>
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>
                            <Palette size={18} color="var(--primary)" />
                            Personnalisation
                        </h2>

                        <div className={styles.field}>
                            <label>Nom de l'Assistant</label>
                            <Input
                                value={isFreePlan ? 'Mon Assistant Vendo' : formData.name}
                                onChange={(e) => !isFreePlan && setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Mon Assistant Vendo"
                                required
                                disabled={isFreePlan}
                                style={{ opacity: isFreePlan ? 0.7 : 1, cursor: isFreePlan ? 'not-allowed' : 'text' }}
                            />
                            {isFreePlan && (
                                <p className={styles.hint} style={{ marginTop: 8 }}>
                                    <Link href="/billing" className={styles.upgradeLink}>Passer sur un plan payant</Link> <span style={{ color: '#ef4444' }}>pour changer le nom.</span>
                                </p>
                            )}
                        </div>

                        <div className={styles.field}>
                            <label>Sous-titre / Statut</label>
                            <Input
                                value={formData.subtitle}
                                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                placeholder="Ex: Expert Vendo Connecté"
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Couleur de la marque</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    className={styles.colorPicker}
                                />
                                <Input
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    placeholder="#000000"
                                />
                            </div>
                        </div>

                        <div className={styles.field}>
                            <label>Style de l'Avatar</label>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 14, overflow: 'hidden',
                                    border: '1px solid rgba(255, 255, 255, 0.1)', flexShrink: 0,
                                    background: formData.color || '#C8A882',
                                    color: getContrastColor(formData.color || '#C8A882'),
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 'bold', fontSize: 18
                                }}>
                                    {formData.logo_url === 'ICON:BOT' ? (
                                        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 24, color: getContrastColor(formData.color || '#C8A882') }}>V</span>
                                    ) : (
                                        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 24 }}>
                                            {formData.logo_url || formData.name?.charAt(0) || 'V'}
                                        </span>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: 8 }}>
                                    <Button
                                        type="button"
                                        variant={formData.logo_url === 'ICON:BOT' ? 'default' : 'outline'}
                                        onClick={() => setFormData({ ...formData, logo_url: 'ICON:BOT' })}
                                        size="sm"
                                        style={{ background: formData.logo_url === 'ICON:BOT' ? 'var(--primary)' : 'transparent', color: '#fff' }}
                                    >
                                        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 13, marginRight: 8, color: 'white' }}>V</span> Logo Vendo
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={formData.logo_url === 'ICON:BOT' ? 'outline' : 'default'}
                                        onClick={() => {
                                            if (profile?.plan_tier === 'free') return
                                            setFormData({ ...formData, logo_url: formData.name?.charAt(0) || 'V' })
                                        }}
                                        size="sm"
                                        disabled={profile?.plan_tier === 'free'}
                                        style={{
                                            background: formData.logo_url !== 'ICON:BOT' ? 'var(--primary)' : 'transparent',
                                            color: '#fff',
                                            opacity: profile?.plan_tier === 'free' ? 0.5 : 1,
                                            cursor: profile?.plan_tier === 'free' ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        {profile?.plan_tier === 'free' && <Lock size={12} style={{ marginRight: 6 }} />}
                                        Lettre
                                    </Button>
                                </div>
                            </div>

                            {formData.logo_url !== 'ICON:BOT' && (
                                <div style={{ marginTop: 10 }}>
                                    <label style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>Modifier la lettre :</label>
                                    <Input
                                        value={formData.logo_url}
                                        onChange={(e) => setFormData({ ...formData, logo_url: e.target.value.slice(0, 2).toUpperCase() })}
                                        placeholder="V"
                                        maxLength={2}
                                        style={{ width: 80, textAlign: 'center', fontWeight: 'bold' }}
                                    />
                                </div>
                            )}
                            {profile?.plan_tier === 'free' && (
                                <p className={styles.hint} style={{ color: '#ef4444', marginTop: 8 }}>
                                    <Link href="/billing" className={styles.upgradeLink}>Passer sur un plan payant</Link> pour choisir l'initiale.
                                </p>
                            )}
                        </div>

                        <div className={styles.field} style={{ marginTop: 24 }}>
                            <label>Thème du Chatbot</label>
                            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                                <Button
                                    type="button"
                                    variant={formData.theme === 'light' ? 'default' : 'outline'}
                                    onClick={() => setFormData({ ...formData, theme: 'light' })}
                                    size="sm"
                                    style={{
                                        flex: 1,
                                        background: formData.theme === 'light' ? 'var(--primary)' : 'transparent',
                                        color: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8
                                    }}
                                >
                                    Mode Clair
                                </Button>
                                <Button
                                    type="button"
                                    variant={formData.theme === 'dark' ? 'default' : 'outline'}
                                    onClick={() => setFormData({ ...formData, theme: 'dark' })}
                                    size="sm"
                                    style={{
                                        flex: 1,
                                        background: formData.theme === 'dark' ? 'var(--primary)' : 'transparent',
                                        color: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8
                                    }}
                                >
                                    Mode Sombre
                                </Button>
                            </div>
                            <p className={styles.hint} style={{ marginTop: 8 }}>
                                Choisissez l'apparence de votre widget sur votre site.
                            </p>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>
                            <Bot size={18} color="var(--primary)" />
                            Entraînement & Contexte
                        </h3>
                        <div className={styles.field}>
                            <label>Sources de Données</label>
                            <textarea
                                className={styles.textarea}
                                rows={6}
                                value={formData.data_sources}
                                onChange={(e) => setFormData({ ...formData, data_sources: e.target.value })}
                                placeholder="Collez le texte directement ici pour que le bot connaisse votre entreprise..."
                            />
                            <p className={styles.hint}>Le bot utilisera ce texte pour répondre aux questions des utilisateurs.</p>
                        </div>
                    </div>

                    <div>
                        <div style={{ pointerEvents: 'auto', opacity: 1 }}>
                            <div className={styles.card}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                                    <div>
                                        <h3 className={styles.cardTitle} style={{ marginBottom: 0, border: 'none', padding: 0 }}>
                                            <Zap size={18} color="var(--primary)" />
                                            Popups Automatiques
                                        </h3>
                                        <p className={styles.hint} style={{ margin: 0 }}>Configurez l&apos;apparition automatique de popup</p>
                                    </div>
                                    <Button type="button" size="sm" onClick={addTrigger}>
                                        <Plus size={16} style={{ marginRight: 6 }} /> Ajouter
                                    </Button>
                                </div>

                                <div style={{ display: 'grid', gap: 24 }}>
                                    {triggers.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '20px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 12 }}>
                                            <p className={styles.hint}>Aucune popup configurée</p>
                                        </div>
                                    )}

                                    {triggers.map((trigger, idx) => (
                                        <div key={trigger.id} style={{ padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                                            <button
                                                type="button"
                                                onClick={() => removeTrigger(trigger.id)}
                                                style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>

                                            <div style={{ display: 'grid', gap: 16 }}>
                                                <div>
                                                    <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255, 255, 255, 0.4)', marginBottom: 8, display: 'block' }}>
                                                        Message Proactif #{idx + 1}
                                                    </label>
                                                    <Input
                                                        value={trigger.message}
                                                        onChange={(e) => updateTrigger(trigger.id, { message: e.target.value })}
                                                        placeholder="Bonjour ! Je peux vous aider ?"
                                                    />
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 12 }}>
                                                    <div>
                                                        <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255, 255, 255, 0.4)', marginBottom: 8, display: 'block' }}>
                                                            Page (ex: /contact)
                                                        </label>
                                                        <Input
                                                            value={trigger.page}
                                                            onChange={(e) => updateTrigger(trigger.id, { page: e.target.value })}
                                                            placeholder="L'URL de votre page"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255, 255, 255, 0.4)', marginBottom: 8, display: 'block' }}>
                                                            Apparition (sec)
                                                        </label>
                                                        <Input
                                                            type="number"
                                                            value={trigger.spawn}
                                                            onChange={(e) => updateTrigger(trigger.id, { spawn: e.target.value })}
                                                            placeholder="ex:1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255, 255, 255, 0.4)', marginBottom: 8, display: 'block' }}>
                                                            Disparition (sec)
                                                        </label>
                                                        <Input
                                                            type="number"
                                                            value={trigger.despawn}
                                                            onChange={(e) => updateTrigger(trigger.id, { despawn: e.target.value })}
                                                            placeholder="ex:5"
                                                        />
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                                                    <input
                                                        type="checkbox"
                                                        id={`once-${trigger.id}`}
                                                        checked={trigger.oncePerUser || false}
                                                        onChange={(e) => updateTrigger(trigger.id, { oncePerUser: e.target.checked })}
                                                        style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--primary)' }}
                                                    />
                                                    <label htmlFor={`once-${trigger.id}`} style={{ fontSize: 13, cursor: 'pointer', color: 'rgba(255, 255, 255, 0.8)' }}>
                                                        Nouveaux visiteurs uniquement (S'affiche une seule fois par utilisateur)
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.sideCol}>
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>
                            <MessageSquare size={18} color="var(--primary)" />
                            Comportement
                        </h3>

                        <div className={styles.field}>
                            <label>Premier Message du Chatbot</label>
                            <textarea
                                className={styles.textarea}
                                rows={3}
                                value={formData.welcome_message_new}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    welcome_message_new: e.target.value,
                                    welcome_message_returning: e.target.value
                                })}
                                placeholder="Bonjour ! Comment puis-je vous aider ?"
                            />
                            <p className={styles.hint}>C&apos;est le tout premier message que le visiteur verra en ouvrant la fenêtre de chat.</p>
                        </div>

                        <div className={styles.field}>
                            <label>Prompt Système</label>
                            <textarea
                                className={styles.textarea}
                                rows={10}
                                value={formData.system_prompt}
                                onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                            />
                            <p className={styles.hint}>Instructions pour le comportement du bot (ton, style, etc).</p>
                        </div>


                    </div>



                    {/* Embed Code Section - Always Visible */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>
                            <Code size={18} color="var(--primary)" />
                            Intégrer sur votre site
                        </h3>

                        {!botId && (
                            <div style={{ marginBottom: 12, padding: 12, background: 'rgba(249, 115, 22, 0.05)', borderLeft: '4px solid #f97316', color: '#f97316', fontSize: 13, borderRadius: 8 }}>
                                ⚠️ <strong>Important :</strong> Vous devez sauvegarder ce chatbot pour générer son ID unique et obtenir le code final.
                            </div>
                        )}

                        <p className={styles.hint} style={{ marginBottom: 12 }}>Copiez ce code dans la balise &lt;body&gt; de votre site :</p>

                        <div className={styles.codeBlock} style={{ background: '#030308', color: '#8b5cf6', padding: 20, borderRadius: 12, fontSize: 13, fontFamily: 'monospace', overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <span style={{ color: '#E596FD' }}>&lt;script</span> <br />
                            &nbsp;&nbsp;&nbsp;src=<span style={{ color: '#FFF' }}>&quot;{(typeof window !== 'undefined' ? window.location.origin : 'https://usevendo.com')}/embed.js&quot;</span> <br />
                            &nbsp;&nbsp;&nbsp;data-chatbot-id=<span style={{ color: '#FFF' }}>&quot;{botId || 'GENERE_APRES_SAUVEGARDE'}&quot;</span> <br />
                            &nbsp;&nbsp;&nbsp;<span style={{ color: '#E596FD' }}>async</span> <br />
                            <span style={{ color: '#E596FD' }}>&gt;&lt;/script&gt;</span>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    )
}
