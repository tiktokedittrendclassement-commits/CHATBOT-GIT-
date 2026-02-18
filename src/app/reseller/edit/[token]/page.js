'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Save, CheckCircle2, MessageSquare, Palette, Settings, Database, Bot } from 'lucide-react'
import styles from './client-editor.module.css'

export default function ClientEditorPage() {
    const { token } = useParams()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        color: '#673DE6',
        logo_url: '',
        system_prompt: '',
        data_sources: ''
    })

    useEffect(() => {
        if (!token) return

        const fetchBot = async () => {
            try {
                const res = await fetch(`/api/reseller/chatbots?token=${token}`)
                if (!res.ok) throw new Error('Accès invalide ou chatbot non trouvé.')
                const data = await res.json()

                setFormData({
                    name: data.name,
                    color: data.color || '#673DE6',
                    logo_url: data.logo_url || '',
                    system_prompt: data.system_prompt,
                    data_sources: data.data_sources || ''
                })
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchBot()
    }, [token])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setSuccess(false)
        setError(null)

        try {
            const res = await fetch(`/api/reseller/chatbots?token=${token}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!res.ok) throw new Error('Erreur lors de la sauvegarde.')

            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return (
        <div className={styles.centered}>
            <div className={styles.spinner}></div>
            <p>Chargement de votre assistant...</p>
        </div>
    )

    if (error && !formData.name) return (
        <div className={styles.centered}>
            <div className={styles.errorCard}>
                <h2>Erreur</h2>
                <p>{error}</p>
                <p>Veuillez contacter votre administrateur.</p>
            </div>
        </div>
    )

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Personnalisation de votre Assistant</h1>
                        <p className={styles.subtitle}>Modifiez l'apparence et les connaissances de votre chatbot.</p>
                    </div>
                    <Button
                        onClick={handleSubmit}
                        disabled={saving}
                        className={styles.saveBtn}
                        size="lg"
                    >
                        {saving ? 'Sauvegarde...' : success ? <><CheckCircle2 size={18} /> Enregistré</> : <><Save size={18} /> Sauvegarder</>}
                    </Button>
                </header>

                {error && <div className={styles.errorBanner}>{error}</div>}

                <div className={styles.content}>
                    <div className={styles.mainGrid}>
                        {/* Identité Section */}
                        <section className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.iconBox}><MessageSquare size={20} /></div>
                                <div>
                                    <h2 className={styles.cardTitle}>Identité</h2>
                                    <p className={styles.cardDesc}>Comment votre bot se présente.</p>
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Nom de l'Assistant</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ex: Mon Assistant Client"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Style de l'Avatar</label>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                    <div style={{
                                        width: 44, height: 44, borderRadius: 14, overflow: 'hidden',
                                        border: '1px solid #ddd', flexShrink: 0,
                                        background: formData.color || '#673DE6',
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
                                            onClick={() => setFormData({ ...formData, logo_url: formData.name?.charAt(0) || 'V' })}
                                            size="sm"
                                            style={{ background: formData.logo_url !== 'ICON:BOT' ? '#0F172A' : 'transparent', color: formData.logo_url !== 'ICON:BOT' ? '#fff' : '#0F172A' }}
                                        >
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
                            </div>
                        </section>

                        {/* Design Section */}
                        <section className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.iconBox}><Palette size={20} /></div>
                                <div>
                                    <h2 className={styles.cardTitle}>Apparence</h2>
                                    <p className={styles.cardDesc}>Adaptez le bot à votre marque.</p>
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Couleur principale</label>
                                <div className={styles.colorWrapper}>
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
                        </section>

                        {/* Comportement Section */}
                        <section className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.iconBox}><Settings size={20} /></div>
                                <div>
                                    <h2 className={styles.cardTitle}>Instructions</h2>
                                    <p className={styles.cardDesc}>Définissez le ton et le style du bot.</p>
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Prompt Système (Instructions)</label>
                                <textarea
                                    className={styles.textarea}
                                    rows={8}
                                    value={formData.system_prompt}
                                    onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                                    placeholder="Ex: Sois un conseiller commercial poli et serviable..."
                                />
                            </div>
                        </section>

                        {/* Connaissances Section */}
                        <section className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.iconBox}><Database size={20} /></div>
                                <div>
                                    <h2 className={styles.cardTitle}>Base de connaissance</h2>
                                    <p className={styles.cardDesc}>Informations que le bot doit connaître.</p>
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Données d'entraînement</label>
                                <textarea
                                    className={styles.textarea}
                                    rows={10}
                                    value={formData.data_sources}
                                    onChange={(e) => setFormData({ ...formData, data_sources: e.target.value })}
                                    placeholder="Collez ici les textes sur vos services, prix, FAQ..."
                                />
                            </div>
                        </section>
                    </div>
                </div>

                <footer className={styles.footer}>
                    <p>© {new Date().getFullYear()} - Interface de gestion sécurisée</p>
                </footer>
            </div>
        </div>
    )
}
