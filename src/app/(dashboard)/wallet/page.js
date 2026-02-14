'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Wallet, CreditCard, History, AlertCircle } from 'lucide-react'

export default function WalletPage() {
    const { user } = useAuth()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [amount, setAmount] = useState('10') // Default 10€
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        if (!user) return
        const fetchProfile = async () => {
            const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
            setProfile(data)
            setLoading(false)
        }
        fetchProfile()
    }, [user])

    const handleTopUp = async () => {
        const numAmount = parseFloat(amount) || 0
        if (numAmount < 5) {
            alert("Le montant minimum est de 5€.")
            return
        }

        setProcessing(true)

        // 1 Euro = 1,000,000 Micros
        const microsToAdd = numAmount * 1000000

        await new Promise(r => setTimeout(r, 1500)) // Fake delay

        // Call generic increment RPC if available or update directly
        // Ideally should match the "decrement" logic reversed.
        const { error } = await supabase
            .from('profiles')
            .update({ credits_balance: (profile.credits_balance || 0) + microsToAdd })
            .eq('id', user.id)

        if (error) {
            alert('Erreur: ' + error.message)
        } else {
            const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
            setProfile(data)
            alert(`Paiement réussi ! ${numAmount.toFixed(2)}€ ajoutés.`)
        }
        setProcessing(false)
    }

    if (loading) return <div style={{ padding: 24 }}>Chargement du portefeuille...</div>

    // Convert micros to Euros for display
    const balanceEuros = (profile?.credits_balance || 0) / 1000000

    // Cost per message in Euros (100 micros)
    const costPerMessage = 0.0001

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Wallet className="text-blue-600" />
                Portefeuille & Coûts
            </h1>
            <p style={{ color: '#64748b', marginBottom: 32 }}>Gérez votre solde pour l'utilisation de l'IA.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 2fr) 1fr', gap: 24, alignItems: 'start' }}>

                {/* Main Card: Usage & Top Up */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                    {/* Balance Card */}
                    <div style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', borderRadius: 12, padding: 24, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                        <div>
                            <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 4 }}>Solde actuel</div>
                            <div style={{ fontSize: 36, fontWeight: 'bold' }}>{balanceEuros.toFixed(2)} <span style={{ fontSize: 20 }}>€</span></div>
                            <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
                                ~ {(balanceEuros / costPerMessage).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} messages restants
                            </div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: '50%' }}>
                            <History size={24} color="white" />
                        </div>
                    </div>

                    {/* Alert / Explanation */}
                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: 16, display: 'flex', gap: 12 }}>
                        <AlertCircle className="text-blue-600" size={24} style={{ flexShrink: 0 }} />
                        <div>
                            <h4 style={{ fontWeight: 600, color: '#1e40af', marginBottom: 4 }}>Transparence des Coûts</h4>
                            <p style={{ fontSize: 14, color: '#1e3a8a', lineHeight: '1.5' }}>
                                Vous payez uniquement ce que vous consommez.<br />
                                <strong>Prix par message :</strong> environ 0.0001€.<br />
                                <span style={{ fontWeight: 600 }}>Soit 50 messages pour seulement 0.005€.</span>
                            </p>
                        </div>
                    </div>

                    {/* Top Up Form */}
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 24 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <CreditCard size={20} />
                            Recharger le solde
                        </h3>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Montant à ajouter (€)</label>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <Input
                                        type="text"
                                        value={amount}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/[^0-9]/g, '')
                                            setAmount(val)
                                        }}
                                        placeholder="10"
                                        style={{ paddingLeft: 24 }}
                                    />
                                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>€</span>
                                </div>
                                <Button onClick={handleTopUp} disabled={processing || parseFloat(amount) < 5}>
                                    {processing ? 'Traitement...' : `Payer ${amount || 0}€`}
                                </Button>
                            </div>
                            <p style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>Minimum 5€.</p>
                        </div>

                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {[10, 20, 50, 100].map(val => (
                                <button
                                    key={val}
                                    onClick={() => setAmount(val)}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: 20,
                                        border: `1px solid ${parseFloat(amount) === val ? '#2563eb' : '#e2e8f0'}`,
                                        background: parseFloat(amount) === val ? '#eff6ff' : '#fff',
                                        color: parseFloat(amount) === val ? '#2563eb' : '#64748b',
                                        cursor: 'pointer',
                                        fontSize: 14,
                                        fontWeight: 500
                                    }}
                                >
                                    {val}€
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ background: '#f8fafc', padding: 20, borderRadius: 8 }}>
                        <h4 style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Exemple de Facturation</h4>
                        <ul style={{ fontSize: 14, color: '#64748b', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>1 Message</span>
                                <strong>~0.0001€</strong>
                            </li>
                            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>50 Messages</span>
                                <strong>~0.005€</strong>
                            </li>
                            <li style={{ borderTop: '1px solid #e2e8f0', paddingTop: 8, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                                <span>1 000 Messages</span>
                                <strong>~0.10€</strong>
                            </li>
                            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>100 000 Messages</span>
                                <strong>~10.00€</strong>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
