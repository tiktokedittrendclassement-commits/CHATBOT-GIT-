'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Brain, MessageSquare, AlertCircle, FileText, List, Sparkles, Lock } from 'lucide-react'
import Link from 'next/link'

export default function StatisticsPage() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [analyzing, setAnalyzing] = useState(false)
    const [chatbots, setChatbots] = useState([])
    const [selectedBot, setSelectedBot] = useState('all')
    const [analysis, setAnalysis] = useState(null)
    const [messageCount, setMessageCount] = useState(0)

    const [profile, setProfile] = useState(null)

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
        setAnalyzing(true)
        setAnalysis(null) // Reset previous

        try {
            // 1. Fetch Messages Client-Side (leveraging RLS)
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
                .limit(50) // Limit to last 50 for quick analysis

            if (selectedBot !== 'all') {
                query = query.eq('conversations.chatbot_id', selectedBot)
            } else if (chatbots.length > 0) {
                // If 'all', ensure we only get messages from user's bots (RLS handles this usually via conversation owner check)
                // But let's filter to be safe if RLS on messages is loose
                const botIds = chatbots.map(b => b.id)
                query = query.in('conversations.chatbot_id', botIds)
            }

            const { data: messages, error } = await query

            if (error) throw error

            setMessageCount(messages?.length || 0)

            if (!messages || messages.length === 0) {
                setAnalysis({
                    summary: "Pas assez de données pour l'analyse.",
                    topQuestions: [],
                    recommendations: { prompt: "", missingData: [] }
                })
                setAnalyzing(false)
                return
            }

            // 2. Call Analysis API
            const response = await fetch('/api/analyze-stats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: messages,
                    contextInfo: `Chatbot Name: ${selectedBot === 'all' ? 'All Chatbots' : chatbots.find(b => b.id === selectedBot)?.name}`
                })
            })

            const result = await response.json()
            setAnalysis(result)

        } catch (err) {
            console.error(err)
            alert("Erreur lors de l'analyse: " + err.message)
        } finally {
            setAnalyzing(false)
        }
    }

    if (loading) return <div style={{ padding: 40 }}>Chargement...</div>

    const isFreePlan = profile?.plan_tier === 'free' || !profile?.plan_tier;

    // Modified runAnalysis to block free plan
    const handleRunAnalysis = async () => {
        if (isFreePlan) {
            alert("Cette fonctionnalité est réservée aux membres Pro. Veuillez mettre à jour votre plan.")
            return
        }
        await runAnalysis()
    }

    return (
        <div style={{ paddingBottom: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: '#1e293b' }}>
                        Statistiques IA
                        {isFreePlan && <span style={{ fontSize: 12, background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: 12, marginLeft: 12, verticalAlign: 'middle' }}>PRO</span>}
                    </h1>
                    <p style={{ color: '#64748b' }}>Analysez vos conversations pour améliorer votre assistant.</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <select
                        value={selectedBot}
                        onChange={(e) => setSelectedBot(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none' }}
                    >
                        <option value="all">Tous les chatbots</option>
                        {chatbots.map(bot => (
                            <option key={bot.id} value={bot.id}>{bot.name}</option>
                        ))}
                    </select>

                    {isFreePlan ? (
                        <Link href="/billing">
                            <Button style={{ background: 'linear-gradient(to right, #d97706, #b45309)' }}>
                                <Lock size={16} style={{ marginRight: 8 }} />
                                Débloquer (Plan Pro)
                            </Button>
                        </Link>
                    ) : (
                        <Button onClick={handleRunAnalysis} disabled={analyzing}>
                            {analyzing ? (
                                <>
                                    <Sparkles size={16} style={{ marginRight: 8, animation: 'spin 2s linear infinite' }} />
                                    Analyse en cours...
                                </>
                            ) : (
                                <>
                                    <Brain size={16} style={{ marginRight: 8 }} />
                                    Générer le rapport
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>

            {/* Banner for Free Plan */}
            {isFreePlan && (
                <div style={{
                    background: 'linear-gradient(to right, #fffbeb, #fff)',
                    border: '1px solid #fcd34d',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 24,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16
                }}>
                    <div style={{ background: '#fef3c7', padding: 10, borderRadius: '50%', color: '#d97706' }}>
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h3 style={{ fontWeight: 600, color: '#92400e', marginBottom: 4 }}>Passez à l&apos;analyse IA avancée</h3>
                        <p style={{ fontSize: 14, color: '#b45309', margin: 0 }}>
                            Obtenez des résumés automatiques, détectez les questions fréquentes et améliorez votre prompt en un clic avec le Plan Pro.
                        </p>
                    </div>
                </div>
            )}

            {analysis ? (
                <div style={{ animation: 'fadeIn 0.5s ease', opacity: isFreePlan ? 0.5 : 1, pointerEvents: isFreePlan ? 'none' : 'auto' }}>

                    {/* Summary Section */}
                    <div style={{ background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <div style={{ background: '#eff6ff', padding: 8, borderRadius: 8, color: '#2563eb' }}>
                                <FileText size={20} />
                            </div>
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: 0 }}>Résumé des conversations</h3>
                        </div>
                        <p style={{ lineHeight: 1.6, color: '#475569', fontSize: 15 }}>
                            {analysis.summary}
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

                        {/* Top Questions */}
                        <div style={{ background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                <div style={{ background: '#f5f3ff', padding: 8, borderRadius: 8, color: '#7c3aed' }}>
                                    <List size={20} />
                                </div>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 }}>Questions Fréquentes</h3>
                            </div>
                            <ul style={{ paddingLeft: 20, margin: 0, color: '#475569' }}>
                                {analysis.topQuestions?.map((q, i) => (
                                    <li key={i} style={{ marginBottom: 8 }}>{q}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Recommendations */}
                        <div style={{ background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                <div style={{ background: '#ecfdf5', padding: 8, borderRadius: 8, color: '#059669' }}>
                                    <Sparkles size={20} />
                                </div>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 }}>Recommandations IA</h3>
                            </div>
                            {analysis.recommendations?.missingData?.length > 0 && (
                                <div style={{ marginBottom: 16 }}>
                                    <strong style={{ fontSize: 13, color: '#ef4444', display: 'block', marginBottom: 4 }}>Informations Manquantes:</strong>
                                    <ul style={{ fontSize: 14, color: '#64748b', paddingLeft: 20, margin: 0 }}>
                                        {analysis.recommendations.missingData.map((item, i) => <li key={i}>{item}</li>)}
                                    </ul>
                                </div>
                            )}
                            <div>
                                <strong style={{ fontSize: 13, color: '#059669', display: 'block', marginBottom: 4 }}>Suggestion de Prompt:</strong>
                                <p style={{ fontSize: 13, color: '#64748b', background: '#f8fafc', padding: 12, borderRadius: 6, border: '1px dashed #cbd5e1' }}>
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
                <div style={{ textAlign: 'center', padding: 60, background: '#f8fafc', borderRadius: 12, border: '2px dashed #e2e8f0', position: 'relative', overflow: 'hidden' }}>

                    <Brain size={48} style={{ color: '#cbd5e1', marginBottom: 16 }} />
                    <h3 style={{ fontSize: 18, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Lancez l&apos;analyse IA</h3>
                    <p style={{ color: '#94a3b8', maxWidth: 400, margin: '0 auto', marginBottom: 24 }}>
                        L&apos;IA va lire vos dernières conversations pour détecter les tendances, les questions fréquentes et les points d&apos;amélioration.
                    </p>
                    <Button onClick={isFreePlan ? handleRunAnalysis : runAnalysis} disabled={analyzing} style={isFreePlan ? { opacity: 0.8 } : {}}>
                        {isFreePlan ? <><Lock size={16} style={{ marginRight: 8 }} /> Analyse Verrouillée (Pro)</> : "Commencer l'analyse"}
                    </Button>
                </div>
            )}
        </div>
    )
}

// Updated v2 - Removed Overlays
