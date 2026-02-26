'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Brain, MessageSquare, AlertCircle, FileText, List, Sparkles, Lock } from 'lucide-react'
import { CustomSelect } from '@/components/ui/custom-select'
import { PlanRestriction } from '@/components/ui/plan-restriction'
import Link from 'next/link'
import styles from './page.module.css'

export default function StatisticsPage() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [analyzing, setAnalyzing] = useState(false)
    const [chatbots, setChatbots] = useState([])
    const [selectedBot, setSelectedBot] = useState('all')
    const [analysis, setAnalysis] = useState(null)
    const [messageCount, setMessageCount] = useState(0)

    const [profile, setProfile] = useState(null)
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)

    useEffect(() => {
        if (!user) return

        const fetchData = async () => {
            // Fetch Profile for Plan Check
            const { data: profileData } = await supabase
                .from('profiles')
                .select('plan_tier')
                .eq('id', user.id)
                .single()
            setProfile(profileData)

            // Fetch Bots
            const { data: botsData } = await supabase
                .from('chatbots')
                .select('id, name')
                .eq('user_id', user.id)
            setChatbots(botsData || [])
            setLoading(false)
        }

        fetchData()
    }, [user])

    const runAnalysis = async () => {
        console.log('[Analysis] Starting for bot:', selectedBot)
        setAnalyzing(true)
        setAnalysis(null)

        try {
            // 1. Fetch Messages
            let query = supabase
                .from('messages')
                .select(`
                    content,
                    created_at,
                    conversations!inner (
                        chatbot_id
                    )
                `)
                .eq('role', 'user')
                .order('created_at', { ascending: false })
                .limit(50)

            if (selectedBot !== 'all') {
                query = query.eq('conversations.chatbot_id', selectedBot)
            } else if (chatbots.length > 0) {
                const botIds = chatbots.map(b => b.id)
                query = query.in('conversations.chatbot_id', botIds)
            }

            const { data: messages, error } = await query
            console.log('[Analysis] Messages fetched:', messages?.length || 0)

            if (error) throw error

            setMessageCount(messages?.length || 0)

            if (!messages || messages.length === 0) {
                setAnalysis({
                    summary: "Pas assez de données pour l'analyse. Essayez de discuter davantage avec votre chatbot.",
                    topQuestions: [],
                    recommendations: { prompt: "", missingData: [] }
                })
                return
            }

            // 2. Call API
            console.log('[Analysis] Calling AI API...')
            const response = await fetch('/api/analyze-stats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: messages,
                    contextInfo: `Chatbot Name: ${selectedBot === 'all' ? 'Tous les chatbots' : chatbots.find(b => b.id === selectedBot)?.name}`
                })
            })

            if (!response.ok) {
                const errData = await response.json()
                throw new Error(errData.error || 'Erreur serveur API')
            }

            const result = await response.json()
            console.log('[Analysis] Success:', result.summary?.substring(0, 50))
            setAnalysis(result)

        } catch (err) {
            console.error('[Analysis] Error:', err)
            alert("Erreur lors de l'analyse : " + (err.message || "Erreur inconnue"))
        } finally {
            setAnalyzing(false)
        }
    }

    if (loading) return <div style={{ padding: 40, color: 'rgba(255, 255, 255, 0.4)', textAlign: 'center' }}>Chargement...</div>

    const isFreePlan = profile?.plan_tier === 'free' || !profile?.plan_tier;

    // Modified runAnalysis to reveal UI for free plan without real data
    const handleRunAnalysis = async () => {
        if (isFreePlan) {
            setAnalyzing(true)
            await new Promise(resolve => setTimeout(resolve, 1500)) // Fake loading
            setAnalysis({
                summary: "Mettez à niveau votre compte pour que l'IA puisse analyser vos conversations et générer un rapport détaillé.",
                topQuestions: [
                    "Donnée restreinte (Plan Pro)",
                    "Donnée restreinte (Plan Pro)",
                    "Donnée restreinte (Plan Pro)"
                ],
                recommendations: {
                    missingData: ["Donnée restreinte (Plan Pro)"],
                    prompt: "La suggestion de prompt système est réservée aux abonnements Pro."
                }
            })
            setAnalyzing(false)
            return
        }
        await runAnalysis()
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.heading}>
                        Statistiques IA
                    </h1>
                    <p className={styles.subheading}>Analysez vos conversations pour améliorer votre assistant.</p>
                </div>
                <div className={styles.headerActions}>
                    <CustomSelect
                        options={[
                            { value: 'all', label: 'Tous les chatbots' },
                            ...chatbots.map(bot => ({ value: bot.id, label: bot.name }))
                        ]}
                        value={selectedBot}
                        onChange={(val) => setSelectedBot(val)}
                    />

                    <Button onClick={handleRunAnalysis} disabled={analyzing} className={styles.analyzeBtn}>
                        {analyzing ? (
                            <>
                                <Sparkles size={16} className={styles.spin} style={{ marginRight: 8 }} />
                                Analyse en cours...
                            </>
                        ) : (
                            <>
                                <Brain size={16} style={{ marginRight: 8 }} />
                                Générer le rapport
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Banner for Free Plan */}
            <div style={{ position: 'relative' }}>
                {isFreePlan && (
                    <PlanRestriction
                        tier="Pro"
                        description="L'IA analyse vos conversations pour extraire des points clés exploitables et booster vos ventes. Réservé aux membres <strong>Pro</strong>."
                        isOverlay={false}
                    />
                )}
                <div style={{ pointerEvents: 'auto', opacity: 1 }}>
                    <div className={styles.chartsGrid}>
                        {/* Conversions Chart */}
                        <div className={styles.chartCard}>
                            <div className={styles.chartHeader}>
                            </div>
                            <div className={styles.chartPlaceholder}>
                                <div className={styles.barContainer}>
                                    {[40, 65, 45, 90, 55, 75, 85].map((h, i) => (
                                        <div key={i} className={styles.bar} style={{ height: `${h}%` }}></div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Distribution Chart */}
                        <div className={styles.chartCard}>
                            <div className={styles.chartHeader}>
                            </div>
                            <div className={styles.chartPlaceholder}>
                                <div className={styles.piePlaceholder}></div>
                                <div className={styles.legend}>
                                    <div className={styles.legendItem}><span style={{ background: '#8B5CF6' }}></span></div>
                                    <div className={styles.legendItem}><span style={{ background: '#EC4899' }}></span></div>
                                    <div className={styles.legendItem}><span style={{ background: '#3B82F6' }}></span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {analysis ? (
                <div className={styles.analysisContainer} style={{ pointerEvents: 'auto' }}>

                    {/* Summary Section */}
                    <div className={styles.summaryCard}>
                        <div className={styles.cardHeader}>
                            <div className={`${styles.iconBox} ${styles.iconBoxBlue}`}>
                                <FileText size={20} />
                            </div>
                            <h3 className={styles.cardTitle}>Résumé des conversations</h3>
                        </div>
                        <p className={styles.cardText}>
                            {analysis.summary}
                        </p>
                    </div>

                    <div className={styles.gridTwo}>

                        {/* Top Questions */}
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={`${styles.iconBox} ${styles.iconBoxViolet}`}>
                                    <List size={20} />
                                </div>
                                <h3 className={styles.cardTitle} style={{ fontSize: 16 }}>Questions Fréquentes</h3>
                            </div>
                            <ul className={styles.list}>
                                {analysis.topQuestions?.map((q, i) => (
                                    <li key={i} className={styles.listItem}>{q}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Recommendations */}
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={`${styles.iconBox} ${styles.iconBoxGreen}`}>
                                    <Sparkles size={20} />
                                </div>
                                <h3 className={styles.cardTitle} style={{ fontSize: 16 }}>Recommandations IA</h3>
                            </div>
                            {analysis.recommendations?.missingData?.length > 0 && (
                                <div style={{ marginBottom: 16 }}>
                                    <strong style={{ fontSize: 13, color: '#ef4444', display: 'block', marginBottom: 4 }}>Informations Manquantes:</strong>
                                    <ul className={styles.list} style={{ fontSize: 14 }}>
                                        {analysis.recommendations.missingData.map((item, i) => <li key={i}>{item}</li>)}
                                    </ul>
                                </div>
                            )}
                            <div>
                                <strong className={styles.recommendationsTitle}>suggestion de prompt system</strong>
                                <p className={styles.promptBox}>
                                    {analysis.recommendations?.prompt || "Aucune suggestion spécifique."}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: 32 }}>
                        <Button variant="outline" onClick={() => setAnalysis(null)}>Nouvelle analyse</Button>
                    </div>
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <Brain size={48} className={styles.emptyIcon} />
                    <h3 className={styles.emptyTitle}>Lancez l&apos;analyse IA</h3>
                    <p className={styles.emptyText}>
                        L&apos;IA va lire vos dernières conversations pour détecter les tendances, les questions fréquentes et les points d&apos;amélioration.
                    </p>
                    <Button onClick={handleRunAnalysis} disabled={analyzing} className={styles.analyzeBtn}>
                        {analyzing ? "Analyse en cours..." : "Commencer l'analyse"}
                    </Button>
                </div>
            )}
        </div>
    )
}

// Updated v2 - Removed Overlays
