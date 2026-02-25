
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
    Users,
    TrendingUp,
    ChevronRight,
    Bell,
    User,
    Mail
} from 'lucide-react'
import { useState, useEffect } from 'react'

const navItems = [
    { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/chatbots', label: 'mes chatbots', icon: Bot },
    { href: '/conversations', label: 'conversation', icon: MessageSquare },
    { href: '/statistics', label: 'statistique ia', icon: TrendingUp },
    { href: '/marketing-email', label: 'marketing email', icon: Mail },
    { href: '/marketing-whatsapp', label: 'marketing whatsapp', icon: MessageSquare },
    { href: '/insights', label: 'visiteurs', icon: Users },
    { href: '/reseller', label: 'revendeur', icon: Users },
    { href: '/wallet', label: 'portefeuille', icon: Wallet },
    { href: '/billing', label: 'abonnement', icon: CreditCard },
    { href: '/settings', label: 'parametre', icon: Settings },
]

export default function DashboardLayout({ children }) {
    const pathname = usePathname()
    const { user, signOut } = useAuth()
    const router = useRouter()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // Breadcrumbs logic
    const pathParts = pathname.split('/').filter(part => part)

    // Translation map for path parts
    const translations = {
        'dashboard': 'Tableau de bord',
        'chatbots': 'Mes Chatbots',
        'conversations': 'Conversations',
        'statistics': 'Statistiques IA',
        'insights': 'Visiteurs',
        'wallet': 'Portefeuille',
        'billing': 'Abonnement',
        'settings': 'Paramètres',
        'reseller': 'Revendeur',
        'marketing-email': 'Marketing Email',
        'marketing-whatsapp': 'Marketing WhatsApp',
        'new': 'Nouveau'
    }

    const breadcrumbs = pathParts.map((part, index) => {
        const href = `/${pathParts.slice(0, index + 1).join('/')}`
        const label = translations[part.toLowerCase()] || (part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '))
        return { href, label, isLast: index === pathParts.length - 1 }
    })
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
        return navItems
    }

    const currentNavItems = getNavItems()

    const handleSignOut = async () => {
        await signOut()
    }

    const handleLinkClick = () => {
        setMobileMenuOpen(false)
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
                            onClick={handleLinkClick}
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
                {/* TopBar (Premium) */}
                <header className={styles.topBar}>
                    <div className={styles.topBarLeft}>
                        <button className={styles.mobileMenuBtn} onClick={() => setMobileMenuOpen(true)}>
                            <Menu size={20} />
                        </button>
                        <div className={styles.breadcrumbs}>
                            <LayoutDashboard size={14} className={styles.breadcrumbIcon} />
                            {breadcrumbs.length > 0 ? (
                                breadcrumbs.map((crumb, idx) => (
                                    <div key={idx} className={styles.breadcrumbItem}>
                                        <ChevronRight size={14} className={styles.breadcrumbSeparator} />
                                        <Link href={crumb.href} className={crumb.isLast ? styles.breadcrumbActive : styles.breadcrumbLink}>
                                            {crumb.label}
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <>
                                    <ChevronRight size={14} className={styles.breadcrumbSeparator} />
                                    <span className={styles.breadcrumbActive}>Tableau de bord</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className={styles.topBarRight}>
                        {/* Profile summary removed */}
                    </div>
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
