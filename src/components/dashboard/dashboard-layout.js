
'use client'

import styles from './layout.module.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import {
    LayoutDashboard,
    MessageSquare,
    Bot,
    CreditCard,
    Wallet,
    Settings,
    LogOut,
    Menu,
    X,
    Users
} from 'lucide-react'
import { useState, useEffect } from 'react'

const navItems = [
    { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/chatbots', label: 'Mes Chatbots', icon: Bot },
    { href: '/conversations', label: 'Conversations', icon: MessageSquare },
    { href: '/statistics', label: 'Statistiques IA', icon: MessageSquare }, // Using MessageSquare for now, or create/import ChartBar/PieChart if available
    { href: '/wallet', label: 'Portefeuille', icon: Wallet },
    { href: '/billing', label: 'Abonnement', icon: CreditCard },
    { href: '/settings', label: 'Paramètres', icon: Settings },
]

export default function DashboardLayout({ children }) {
    const pathname = usePathname()
    const { user } = useAuth()
    const router = useRouter()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [profile, setProfile] = useState(null)

    useEffect(() => {
        if (!user) return
        const getProfile = async () => {
            const { data } = await supabase.from('profiles').select('plan_tier').eq('id', user.id).single()
            setProfile(data)
        }
        getProfile()
    }, [user])

    const getNavItems = () => {
        const items = [...navItems]

        // Always add Marketing links (locked state handled in pages)
        items.splice(3, 0, { href: '/marketing-email', label: 'Marketing Email', icon: MessageSquare })
        items.splice(4, 0, { href: '/marketing-whatsapp', label: 'Marketing WhatsApp', icon: MessageSquare })

        // Add Insights (Visible to all, locked for non-agency)
        items.splice(3, 0, { href: '/insights', label: 'Visiteurs', icon: Users }) // Changed to Users icon

        return items
    }

    const currentNavItems = getNavItems()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    return (
        <div className={styles.container}>
            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${mobileMenuOpen ? styles.open : ''}`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logo}>Vendo</div>
                    <button
                        className={styles.closeMenu}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className={styles.nav}>
                    {currentNavItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className={styles.userSection}>
                    <div className={styles.userInfo}>
                        <div className={styles.userEmail}>{user?.email}</div>
                        <div className={styles.userPlan}>
                            {profile?.plan_tier === 'agency' ? 'Plan Agence' :
                                profile?.plan_tier === 'pro' ? 'Plan Pro' : 'Plan Gratuit'}
                        </div>
                    </div>
                    <button onClick={handleSignOut} className={styles.signOutBtn}>
                        <LogOut size={18} />
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.main}>
                {/* Mobile Header */}
                <header className={styles.mobileHeader}>
                    <button onClick={() => setMobileMenuOpen(true)}>
                        <Menu size={24} />
                    </button>
                    <div className={styles.logoMobile}>Vendo</div>
                </header>

                <div className={styles.content}>
                    <div className={styles.childrenWrapper}>
                        {children}
                    </div>
                </div>
            </main>

            {/* Overlay */}
            {mobileMenuOpen && (
                <div
                    className={styles.overlay}
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}
        </div>
    )
}
