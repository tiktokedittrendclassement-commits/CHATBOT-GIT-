'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import styles from './page.module.css'
import { ShoppingCart, Clock, User, ArrowRight, Package, AlertCircle, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PlanRestriction } from '@/components/ui/plan-restriction'
import { formatDate } from '@/lib/utils'

export default function AbandonedCartsPage() {
    const { user } = useAuth()
    const [profile, setProfile] = useState(null)
    const [carts, setCarts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        const fetchData = async () => {
            try {
                // Fetch profile to check plan
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('plan_tier')
                    .eq('id', user.id)
                    .single()
                setProfile(profileData || { plan_tier: 'free' })

                // Fetch my chatbots
                const { data: myBots } = await supabase
                    .from('chatbots')
                    .select('id')
                    .eq('user_id', user.id)

                if (myBots?.length) {
                    const botIds = myBots.map(b => b.id)

                    // Fetch abandoned carts
                    const { data: cartsData, error } = await supabase
                        .from('abandoned_carts')
                        .select(`
                            *,
                            chatbots ( name, color )
                        `)
                        .in('chatbot_id', botIds)
                        .order('updated_at', { ascending: false })

                    if (error) console.error('[Abandoned Carts] Error:', error)
                    setCarts(cartsData || [])
                }
            } catch (err) {
                console.error('[Abandoned Carts] Fetch error:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user])

    if (loading) return <div className={styles.loading}>Chargement des paniers...</div>

    const isPro = profile?.plan_tier === 'pro' || profile?.plan_tier === 'agency'

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.heading}>Paniers Abandonnés</h1>
                    <p className={styles.subheading}>Visualisez les produits laissés par vos visiteurs et récupérez vos ventes.</p>
                </div>
            </div>

            {!isPro && (
                <PlanRestriction
                    tier="Pro"
                    description="Suivez en temps réel les paniers abandonnés sur votre boutique et automatisez les relances via votre assistant IA. Réservé aux membres <strong>Pro</strong>."
                    isOverlay={false}
                />
            )}

            <div className={styles.mainContent}>
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>
                            <ShoppingBag size={24} />
                        </div>
                        <div>
                            <div className={styles.statLabel}>Paniers en attente</div>
                            <div className={styles.statValue}>{carts.length}</div>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                            <Package size={24} />
                        </div>
                        <div>
                            <div className={styles.statLabel}>Valeur Totale</div>
                            <div className={styles.statValue}>
                                {carts.reduce((acc, c) => acc + (c.total_amount || 0), 0).toFixed(2)} €
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.tableHeader}>
                        <h2 className={styles.cardTitle}>Dernières Activités</h2>
                    </div>

                    <div className={styles.tableWrapper}>
                        {carts.length > 0 ? (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>VISITEUR</th>
                                        <th>ARTICLES</th>
                                        <th>TOTAL</th>
                                        <th>DATE</th>
                                        <th>CHATBOT</th>
                                        <th>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {carts.map(cart => (
                                        <tr key={cart.id}>
                                            <td>
                                                <div className={styles.visitorRow}>
                                                    <div className={styles.visitorIcon}>
                                                        <User size={16} />
                                                    </div>
                                                    <div>
                                                        <div className={styles.visitorId}>#{cart.visitor_id.substring(0, 8)}</div>
                                                        <div className={styles.visitorSource}>{cart.last_page_url ? new URL(cart.last_page_url).pathname : 'Inconnue'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.itemsList}>
                                                    {cart.cart_items?.slice(0, 2).map((item, i) => (
                                                        <div key={i} className={styles.itemTag}>
                                                            {item.name} (x{item.quantity || 1})
                                                        </div>
                                                    ))}
                                                    {cart.cart_items?.length > 2 && (
                                                        <div className={styles.itemTag}>+{cart.cart_items.length - 2} autres</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.amount}>{cart.total_amount?.toFixed(2)} {cart.currency || 'EUR'}</div>
                                            </td>
                                            <td>
                                                <div className={styles.dateRow}>
                                                    <Clock size={14} style={{ marginRight: 6, opacity: 0.5 }} />
                                                    {formatDate(cart.updated_at)}
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.botRow}>
                                                    <div className={styles.botDot} style={{ background: cart.chatbots?.color }}></div>
                                                    {cart.chatbots?.name}
                                                </div>
                                            </td>
                                            <td>
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/conversations?visitor=${cart.visitor_id}`}>
                                                        <ArrowRight size={16} />
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className={styles.emptyState}>
                                <ShoppingCart size={48} className={styles.emptyIcon} />
                                <h3>Aucun panier détecté</h3>
                                <p>Installez le script Vendo sur votre boutique pour commencer à suivre les paniers abandonnés.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
