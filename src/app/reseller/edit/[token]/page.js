'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Save, CheckCircle2, MessageSquare, Palette, Settings, Database, Bot, Globe, Loader2, Code, Zap, Plus, Trash2, LayoutDashboard, User, DollarSign, TrendingUp, Calendar, AlertTriangle } from 'lucide-react'
import styles from './client-editor.module.css'

export default function ClientEditorPage() {
    const { token } = useParams()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const [activeTab, setActiveTab] = useState('dashboard')

    const [formData, setFormData] = useState({
        name: '',
        subtitle: 'En ligne · répond en 3s',
        color: '#3b82f6',
        logo_url: 'ICON:BOT',
        welcome_message_new: 'Bonjour ! 👋 Comment puis-je vous aider aujourd\'hui ?',
        system_prompt: '',
        data_sources: '',
        theme: 'dark',
        triggers: []
    })

    const [stats, setStats] = useState({
        conversations: 0,
        messages: 0,
        leads: [],
        revenue: 0,
        recentConversations: []
    })

    const [scrapeUrl, setScrapeUrl] = useState('')
    const [isScraping, setIsScraping] = useState(false)

    useEffect(() => {
        if (!token) return

        const fetchBot = async () => {
            try {
                const res = await fetch(`/api/reseller/chatbots?token=${token}`)
                if (!res.ok) throw new Error('Accès invalide ou chatbot non trouvé.')
                const data = await res.json()

                const cleanName = data.name === 'Mon Assistant Vendo' ? '' : data.name
                let cleanColor = data.color || '#3b82f6'
                if (cleanColor.toLowerCase() === '#673de6') {
                    cleanColor = '#3b82f6'
                }

                setFormData({
                    id: data.id,
                    name: cleanName,
                    subtitle: data.subtitle || 'En ligne · répond en 3s',
                    color: cleanColor,
                    logo_url: data.logo_url || 'ICON:BOT',
                    welcome_message_new: data.welcome_message_new || 'Bonjour ! 👋 Comment puis-je vous aider aujourd\'hui ?',
                    system_prompt: data.system_prompt || '',
                    data_sources: data.data_sources || '',
                    theme: data.theme || 'dark',
                    triggers: data.triggers?.map(t => ({ ...t, id: t.id || Math.random().toString(36).substr(2, 9) })) || []
                })

                if (data.stats) {
                    setStats(data.stats)
                }
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchBot()
    }, [token])

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

    const handleScrape = async () => {
        if (!scrapeUrl) return
        setIsScraping(true)
        try {
            const res = await fetch('/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: scrapeUrl })
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)
            setFormData(prev => ({
                ...prev,
                data_sources: prev.data_sources + (prev.data_sources ? '\n\n' : '') + data.data_sources
            }))
            alert(`Succès! ${data.page_count} pages scrappées.`)
            setScrapeUrl('')
        } catch (error) {
            alert('Erreur: ' + error.message)
        } finally {
            setIsScraping(false)
        }
    }

    const handleSubmit = async (e) => {
        if (e) e.preventDefault()
        setSaving(true)
        setSuccess(false)
        try {
            const res = await fetch(`/api/reseller/chatbots?token=${token}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            if (!res.ok) throw new Error('Erreur sauvegarde.')
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return (
        <div className={styles.centered} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#020617', color: '#fff' }}>
            <div className={styles.spinner} style={{ marginBottom: 20 }}></div>
            <p style={{ opacity: 0.6 }}>Chargement de l&apos;interface de gestion...</p>
        </div>
    )

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div>
                        <h1 className={styles.title}>{formData.name || 'Assistant IA'}</h1>
                        <p className={styles.subtitle}>Gérez le cerveau et visualisez les performances de votre assistant.</p>
                    </div>
                    {activeTab === 'settings' && (
                        <Button onClick={handleSubmit} disabled={saving} className={styles.saveBtn}>
                            {saving ? <><Loader2 size={18} className={styles.animateSpin} />...</> : success ? <><CheckCircle2 size={18} /> Enregistré</> : <><Save size={18} /> Sauvegarder</>}
                        </Button>
                    )}
                </header>

                <div className={styles.tabs}>
                    <button className={`${styles.tab} ${activeTab === 'dashboard' ? styles.tabActive : ''}`} onClick={() => setActiveTab('dashboard')}>
                        <LayoutDashboard size={18} /> Tableau de bord
                    </button>
                    <button className={`${styles.tab} ${activeTab === 'settings' ? styles.tabActive : ''}`} onClick={() => setActiveTab('settings')}>
                        <Settings size={18} /> Configuration
                    </button>
                </div>

                {activeTab === 'dashboard' ? (
                    <div className={styles.dashboardView}>
                        <div className={styles.dashboardGrid}>
                            <div className={styles.statCard}>
                                <div className={styles.statCardHeader}>
                                    <div className={styles.statLabel}>Ventes générées</div>
                                    <div className={styles.statIconBox}><DollarSign size={20} /></div>
                                </div>
                                <div className={styles.statValue}>{stats.revenue.toFixed(2)} €</div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statCardHeader}>
                                    <div className={styles.statLabel}>Conversations</div>
                                    <div className={styles.statIconBox}><MessageSquare size={20} /></div>
                                </div>
                                <div className={styles.statValue}>{stats.conversations}</div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statCardHeader}>
                                    <div className={styles.statLabel}>Messages</div>
                                    <div className={styles.statIconBox}><Zap size={20} /></div>
                                </div>
                                <div className={styles.statValue}>{stats.messages}</div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statCardHeader}>
                                    <div className={styles.statLabel}>Contacts (Leads)</div>
                                    <div className={styles.statIconBox}><TrendingUp size={20} /></div>
                                </div>
                                <div className={styles.statValue}>{stats.leads.length}</div>
                            </div>
                        </div>

                        <div className={styles.mainLayout}>
                            <div className={styles.card}>
                                <h2 className={styles.cardTitle}>
                                    <div className={styles.iconBox}><Calendar size={18} /></div>
                                    Dernières Conversations
                                </h2>
                                <div className={styles.list}>
                                    {stats.recentConversations?.length > 0 ? (
                                        stats.recentConversations.map(conv => (
                                            <div key={conv.id} className={styles.listItem}>
                                                <div className={styles.listIcon}><MessageSquare size={18} /></div>
                                                <div className={styles.itemInfo}>
                                                    <div className={styles.itemTitle}>Visiteur #{conv.visitor_id?.substring(0, 5) || 'Anonyme'}</div>
                                                    <div className={styles.itemSub}>{new Date(conv.created_at).toLocaleString()}</div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className={styles.emptyState}>Aucune conversation récente.</div>
                                    )}
                                </div>
                            </div>

                            <div className={styles.card}>
                                <h2 className={styles.cardTitle}>
                                    <div className={styles.iconBox}><User size={18} /></div>
                                    Leads Capturés
                                </h2>
                                <div className={styles.list}>
                                    {stats.leads?.length > 0 ? (
                                        stats.leads.map(lead => (
                                            <div key={lead.id} className={styles.listItem}>
                                                <div className={styles.listIcon}><User size={18} /></div>
                                                <div className={styles.itemInfo}>
                                                    <div className={styles.itemTitle}>{lead.visitor_email || lead.visitor_phone || 'ID: ' + lead.id.substring(0, 5)}</div>
                                                    <div className={styles.itemSub}>{new Date(lead.created_at).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className={styles.emptyState}>Aucun lead pour le moment.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        <div className={styles.mainCol}>
                            <div className={styles.card}>
                                <h2 className={styles.cardTitle}><div className={styles.iconBox}><Palette size={18} /></div> Personnalisation</h2>
                                <div className={styles.formGroup}>
                                    <label>Nom de l&apos;Assistant</label>
                                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Support Client" className={styles.input} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Sous-titre / Statut</label>
                                    <Input value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} placeholder="Ex: En ligne" className={styles.input} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Couleur</label>
                                    <div className={styles.colorWrapper}>
                                        <input type="color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className={styles.colorPicker} />
                                        <Input value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className={styles.input} style={{ width: 120 }} />
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Avatar</label>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                        <div style={{ width: 50, height: 50, borderRadius: 12, background: formData.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20 }}>
                                            {formData.logo_url === 'ICON:BOT' ? <Bot size={26} /> : <span>{formData.logo_url || 'A'}</span>}
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.03)', padding: 4, borderRadius: 10 }}>
                                            <button type="button" onClick={() => setFormData({ ...formData, logo_url: 'ICON:BOT' })} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 13, border: 'none', background: formData.logo_url === 'ICON:BOT' ? '#2563eb' : 'transparent', color: formData.logo_url === 'ICON:BOT' ? '#fff' : 'rgba(255,255,255,0.4)' }}>Robot</button>
                                            <button type="button" onClick={() => setFormData({ ...formData, logo_url: formData.name?.charAt(0) || 'A' })} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 13, border: 'none', background: formData.logo_url !== 'ICON:BOT' ? '#2563eb' : 'transparent', color: formData.logo_url !== 'ICON:BOT' ? '#fff' : 'rgba(255,255,255,0.4)' }}>Lettre</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.card}>
                                <h2 className={styles.cardTitle}><div className={styles.iconBox}><Database size={18} /></div> Entraînement & Contexte</h2>
                                <div className={styles.formGroup}>
                                    <label>Scrapper un site web</label>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <Input placeholder="https://monsite.com" value={scrapeUrl} onChange={(e) => setScrapeUrl(e.target.value)} className={styles.input} />
                                        <Button type="button" onClick={handleScrape} disabled={isScraping} className={styles.scrapBtn}>{isScraping ? <Loader2 size={16} className={styles.animateSpin} /> : 'Scrapper'}</Button>
                                    </div>
                                    <p className={styles.hint}>Récupère automatiquement le contenu des pages de ce domaine.</p>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Données d&apos;entraînement</label>
                                    <textarea className={styles.textarea} rows={10} value={formData.data_sources} onChange={(e) => setFormData({ ...formData, data_sources: e.target.value })} placeholder="Collez ici les textes importants..." />
                                    <p className={styles.hint}>Plus vous donnez de détails, plus l&apos;assistant sera pertinent.</p>
                                </div>
                            </div>

                            <div className={styles.card}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                                    <h2 className={styles.cardTitle} style={{ margin: 0 }}><div className={styles.iconBox}><Zap size={18} /></div> Popups Automatiques</h2>
                                    <Button size="sm" onClick={addTrigger} className={styles.addBtn}><Plus size={14} style={{ marginRight: 6 }} /> Ajouter</Button>
                                </div>
                                <div style={{ display: 'grid', gap: 16 }}>
                                    {formData.triggers?.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '30px', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: 12 }}>
                                            <p className={styles.hint} style={{ margin: 0 }}>Aucune popup configurée. Ajoutez un message proactif pour engager vos visiteurs.</p>
                                        </div>
                                    )}
                                    {formData.triggers?.map((t, i) => (
                                        <div key={t.id} style={{ padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.04)', position: 'relative' }}>
                                            <button type="button" onClick={() => removeTrigger(t.id)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#ef4444', opacity: 0.5, cursor: 'pointer' }}><Trash2 size={16} /></button>

                                            <div style={{ display: 'grid', gap: 16 }}>
                                                <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                                                    <label>Message du Popup #{i + 1}</label>
                                                    <Input value={t.message} onChange={(e) => updateTrigger(t.id, { message: e.target.value })} className={styles.input} />
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                                                    <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                                                        <label>Page (ex: /contact)</label>
                                                        <Input value={t.page} onChange={(e) => updateTrigger(t.id, { page: e.target.value })} placeholder="Toutes les pages" className={styles.input} />
                                                    </div>
                                                    <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                                                        <label>Apparition (s)</label>
                                                        <Input type="number" value={t.spawn} onChange={(e) => updateTrigger(t.id, { spawn: e.target.value })} className={styles.input} />
                                                    </div>
                                                    <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                                                        <label>Disparition (s)</label>
                                                        <Input type="number" value={t.despawn} onChange={(e) => updateTrigger(t.id, { despawn: e.target.value })} className={styles.input} />
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <input
                                                        type="checkbox"
                                                        id={`once-${t.id}`}
                                                        checked={t.oncePerUser || false}
                                                        onChange={(e) => updateTrigger(t.id, { oncePerUser: e.target.checked })}
                                                        style={{ width: 16, height: 16, accentColor: '#2563eb' }}
                                                    />
                                                    <label htmlFor={`once-${t.id}`} style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
                                                        Afficher une seule fois par visiteur
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={styles.sideCol}>
                            <div className={styles.card}>
                                <h2 className={styles.cardTitle}>
                                    <div className={styles.iconBox}><Settings size={18} /></div> Comportement
                                </h2>
                                <div className={styles.formGroup}>
                                    <label>Premier message</label>
                                    <textarea className={styles.textarea} rows={3} value={formData.welcome_message_new} onChange={(e) => setFormData({ ...formData, welcome_message_new: e.target.value })} />
                                    <p className={styles.hint}>Message de bienvenue automatique.</p>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Instructions (Mode d&apos;emploi)</label>
                                    <textarea className={styles.textarea} rows={12} value={formData.system_prompt} onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })} />
                                    <p className={styles.hint}>Définissez la personnalité et les limites du bot.</p>
                                </div>
                            </div>

                            <div className={styles.card}>
                                <h2 className={styles.cardTitle}>
                                    <div className={styles.iconBox}><Code size={18} /></div>
                                    Intégrer sur votre site
                                </h2>

                                <p className={styles.hint} style={{ marginBottom: 12 }}>Copiez ce code dans la balise &lt;body&gt; de votre site :</p>

                                <div className={styles.codeBlock}>
                                    <span className={styles.keyword}>&lt;script</span> <br />
                                    &nbsp;&nbsp;<span className={styles.attr}>src</span>=<span className={styles.string}>&quot;{(typeof window !== 'undefined' ? window.location.origin : '')}/embed.js&quot;</span> <br />
                                    &nbsp;&nbsp;<span className={styles.attr}>data-chatbot-id</span>=<span className={styles.string}>&quot;{formData.id || 'GENERE_APRES_SAUVEGARDE'}&quot;</span> <br />
                                    &nbsp;&nbsp;<span className={styles.keyword}>async</span> <br />
                                    <span className={styles.keyword}>&gt;&lt;/script&gt;</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <footer className={styles.footer}>© {new Date().getFullYear()} - Console de Gestion Assistant IA</footer>
            </div>
        </div>
    )
}
