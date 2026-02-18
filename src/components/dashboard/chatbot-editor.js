
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import styles from './editor.module.css'
import { ArrowLeft, Save, Bot, Lock } from 'lucide-react'

// This component handles both Creating and Editing
export default function ChatbotEditor({ botId = null }) {
    const { user } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(!!botId)

    const [formData, setFormData] = useState({
        name: '',
        color: '#673DE6',
        logo_url: 'ICON:BOT',
        welcome_message_new: 'Bonjour ! 👋 Comment puis-je vous aider aujourd\'hui ?',
        welcome_message_returning: 'Re-bonjour ! Ravi de vous revoir. 👋',
        system_prompt: 'Tu es un assistant commercial humain, chaleureux et direct. Réponds de manière concise, sans utiliser de formatage complexe (pas d\'astérisques). Ta mission est d\'aider le visiteur avec bienveillance.',
        data_sources: ''
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
                        name: data.name,
                        color: data.color,
                        logo_url: data.logo_url || '',
                        // Use ?? so that empty string "" is preserved and not replaced by default
                        welcome_message_new: data.welcome_message_new ?? 'Bonjour ! 👋 Comment puis-je vous aider aujourd\'hui ?',
                        welcome_message_returning: data.welcome_message_returning ?? 'Re-bonjour ! Ravi de vous revoir. 👋',
                        system_prompt: data.system_prompt,
                        data_sources: data.data_sources || ''
                    })
                }
            }
            setFetching(false)
        }

        init()
    }, [botId, user])

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!botId && !canCreate) {
            alert(`You have reached the limit of ${PLAN_LIMITS[profile?.plan_tier || 'free']} chatbots for your plan. Please upgrade.`)
            return
        }

        setLoading(true)

        try {
            const payload = {
                name: profile?.plan_tier === 'free' ? 'Mon Assistant Vendo' : formData.name,
                color: formData.color,
                logo_url: formData.logo_url,
                welcome_message_new: formData.welcome_message_new,
                welcome_message_returning: formData.welcome_message_returning,
                system_prompt: formData.system_prompt,
                data_sources: formData.data_sources
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

            <div className={styles.grid}>
                <div className={styles.mainCol}>
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Paramètres Généraux</h3>

                        <div className={styles.field}>
                            <div className={styles.fieldHeader}>
                                <label>Nom du Chatbot</label>
                                {profile?.plan_tier === 'free' && <span className={styles.badge} style={{ background: '#e2e8f0', color: '#64748b' }}>FIGÉ (GRATUIT)</span>}
                            </div>
                            <Input
                                value={profile?.plan_tier === 'free' ? 'Mon Assistant Vendo' : formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Mon Assistant Commercial"
                                disabled={profile?.plan_tier === 'free'}
                            />
                            {profile?.plan_tier === 'free' && (
                                <p className={styles.hint} style={{ color: '#dc2626' }}>
                                    <Link href="/billing" className={styles.upgradeLink}>Passer sur un plan payant</Link> pour le personnaliser.
                                </p>
                            )}
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
                                    border: '1px solid #ddd', flexShrink: 0,
                                    background: formData.color || '#C8A882',
                                    color: '#fff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 'bold', fontSize: 18
                                }}>
                                    {formData.logo_url === 'ICON:BOT' ? (
                                        <Bot size={24} />
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
                                        style={{ background: formData.logo_url === 'ICON:BOT' ? '#0F172A' : 'transparent', color: formData.logo_url === 'ICON:BOT' ? '#fff' : '#0F172A' }}
                                    >
                                        <Bot size={16} style={{ marginRight: 6 }} /> Robot
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
                                            background: formData.logo_url !== 'ICON:BOT' ? '#0F172A' : 'transparent',
                                            color: formData.logo_url !== 'ICON:BOT' ? '#fff' : '#0F172A',
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
                                <p className={styles.hint} style={{ color: '#dc2626', marginTop: 8 }}>
                                    <Link href="/billing" className={styles.upgradeLink}>Passer sur un plan payant</Link> pour choisir l'initiale.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Entraînement & Contexte</h3>
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
                </div>

                <div className={styles.sideCol}>
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Comportement</h3>

                        <div className={styles.field}>
                            <label>Message de Bienvenue (nouveaux visiteurs)</label>
                            <Input
                                value={formData.welcome_message_new}
                                onChange={(e) => setFormData({ ...formData, welcome_message_new: e.target.value })}
                                placeholder=""
                            />
                            <p className={styles.hint}>Ce message s'affiche pour les nouveaux visiteurs. (Laisser vide pour désactiver)</p>
                        </div>

                        <div className={styles.field}>
                            <label>Message de Bienvenue (Visiteurs de retour)</label>
                            <Input
                                value={formData.welcome_message_returning}
                                onChange={(e) => setFormData({ ...formData, welcome_message_returning: e.target.value })}
                                placeholder=""
                            />
                            <p className={styles.hint}>Ce message s'affiche quand un visiteur revient. (Laisser vide pour désactiver)</p>
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
                        <h3 className={styles.cardTitle}>Intégrer sur votre site</h3>

                        {!botId && (
                            <div style={{ marginBottom: 12, padding: 12, background: '#fff7ed', borderLeft: '4px solid #f97316', color: '#c2410c', fontSize: 13 }}>
                                ⚠️ <strong>Important :</strong> Vous devez sauvegarder ce chatbot pour générer son ID unique et obtenir le code final.
                            </div>
                        )}

                        <p className={styles.hint} style={{ marginBottom: 12 }}>Copiez ce code dans la balise &lt;body&gt; de votre site :</p>

                        <div className={styles.codeBlock} style={{ background: '#1e293b', color: '#e2e8f0', padding: 12, borderRadius: 6, fontSize: 13, fontFamily: 'monospace', overflowX: 'auto' }}>
                            {`<script 
    src="https://usevendo.com/embed.js" 
    data-chatbot-id="${botId || 'GENERE_APRES_SAUVEGARDE'}" 
    async
></script>`}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
