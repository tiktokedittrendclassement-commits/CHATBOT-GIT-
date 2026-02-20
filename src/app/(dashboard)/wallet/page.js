'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Wallet, CreditCard, History, AlertCircle } from 'lucide-react'
import styles from './page.module.css'

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
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.heading}>
                    Portefeuille & Coûts
                </h1>
                <p className={styles.subheading}>Gérez votre solde de crédits et consultez vos coûts d'utilisation.</p>
            </div>

            <div className={styles.grid}>
                {/* Main Column */}
                <div className={styles.mainColumn}>

                    {/* Balance Card - Flat Violet */}
                    <div className={styles.balanceCard}>
                        <div>
                            <div className={styles.balanceLabel}>Solde actuel</div>
                            <div className={styles.balanceAmount}>
                                {balanceEuros.toFixed(2)} <span style={{ fontSize: 24 }}>€</span>
                            </div>
                            <div className={styles.balanceSub}>
                                <Wallet size={14} />
                                ~ {(balanceEuros / costPerMessage).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} messages restants
                            </div>
                        </div>
                        <div className={styles.balanceIcon}>
                            <CreditCard size={28} color="white" />
                        </div>
                    </div>

                    {/* Top Up Card */}
                    <div className={styles.card}>
                        <div className={styles.cardTitle}>
                            <CreditCard size={20} style={{ color: '#673DE6' }} />
                            Recharger le solde
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#334155' }}>Montant à créditer (€)</label>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <div className={styles.inputWrapper}>
                                    <Input
                                        type="text"
                                        value={amount}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/[^0-9]/g, '')
                                            setAmount(val)
                                        }}
                                        placeholder="10"
                                        className={styles.amountInput}
                                    />
                                    <span className={styles.currencySymbol}>€</span>
                                </div>
                                <Button
                                    onClick={handleTopUp}
                                    disabled={processing || parseFloat(amount) < 5}
                                    size="md"
                                >
                                    {processing ? 'Traitement...' : `Payer ${amount || 0}€`}
                                </Button>
                            </div>
                            <p style={{ fontSize: 12, color: '#334155', marginTop: 8 }}>Minimum 5€.</p>
                        </div>

                        <div>
                            <label style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>Montants rapides :</label>
                            <div className={styles.quickAmounts}>
                                {[10, 20, 50, 100].map(val => (
                                    <Button
                                        key={val}
                                        onClick={() => setAmount(val.toString())}
                                        variant={parseFloat(amount) === val ? 'primary' : 'outline'}
                                        size="sm"
                                        className={`${styles.amountBtn} ${parseFloat(amount) === val ? styles.amountBtnActive : ''}`}
                                    >
                                        {val}€
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Transparency Box */}
                    <div className={styles.transparencyBox}>
                        <AlertCircle className={styles.transparencyIcon} size={24} />
                        <div>
                            <h4 className={styles.transparencyTitle}>Transparence des Coûts</h4>
                            <p className={styles.transparencyText}>
                                Vous payez uniquement ce que vous consommez. Le prix par message est d'environ <strong>0.0001€</strong>.<br />
                                Soit 10 000 messages pour seulement <strong>1€</strong>.
                            </p>
                        </div>
                    </div>

                </div>

                {/* Side Column */}
                <div className={styles.sideColumn}>
                    <div className={styles.infoBox}>
                        <div className={styles.infoTitle}>
                            <History size={18} className="text-slate-400" />
                            Tarifs Détaillés
                        </div>
                        <div className={styles.infoList}>
                            <div className={styles.infoItem}>
                                <span>1 Message</span>
                                <strong>~0.0001 €</strong>
                            </div>
                            <div className={styles.infoItem}>
                                <span>1 000 Messages</span>
                                <strong>~0.10 €</strong>
                            </div>
                            <div className={styles.infoItem}>
                                <span>10 000 Messages</span>
                                <strong>~1.00 €</strong>
                            </div>
                            <div className={styles.infoItem}>
                                <span>100 000 Messages</span>
                                <strong>~10.00 €</strong>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    )
}
