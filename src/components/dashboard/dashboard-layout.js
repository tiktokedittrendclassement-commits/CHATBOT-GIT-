
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
    User
} from 'lucide-react'
import { useState, useEffect } from 'react'

const navItems = [
    { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/chatbots', label: 'Mes Chatbots', icon: Bot },
    { href: '/conversations', label: 'Conversations', icon: MessageSquare },
    { href: '/statistics', label: 'Statistiques IA', icon: TrendingUp },
    { href: '/wallet', label: 'Portefeuille', icon: Wallet },
    { href: '/billing', label: 'Abonnement', icon: CreditCard },
    { href: '/settings', label: 'Paramètres', icon: Settings },
]

export default function DashboardLayout({ children }) {
    const pathname = usePathname()
    const { user } = useAuth()
    const router = useRouter()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // Breadcrumbs logic
    const pathParts = pathname.split('/').filter(part => part)
    const breadcrumbs = pathParts.map((part, index) => {
        const href = `/${pathParts.slice(0, index + 1).join('/')}`
        const label = part.charAt(0).toUpperCase() + part.slice(1).replace('-', ' ')
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
        const items = [...navItems]

        // Always add Marketing links (locked state handled in pages)
        items.splice(3, 0, { href: '/marketing-email', label: 'Marketing Email', icon: MessageSquare })
        items.splice(4, 0, { href: '/marketing-whatsapp', label: 'Marketing WhatsApp', icon: MessageSquare })

        // Add Insights (Visible to all, locked for non-agency)
        items.splice(3, 0, { href: '/insights', label: 'Visiteurs', icon: Users }) // Changed to Users icon

        // Add Reseller link for Agency users
        items.splice(3, 0, { href: '/reseller', label: 'Revendeur', icon: Users })

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
                                    <span className={styles.breadcrumbActive}>Dashboard</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className={styles.topBarRight}>
                        <button className={styles.topBarAction}>
                            <Bell size={20} />
                            <span className={styles.notificationDot} />
                        </button>
                        <div className={styles.topBarDivider} />
                        <div className={styles.profileSummary}>
                            <div className={styles.profileAvatar}>
                                <User size={18} />
                            </div>
                            <span className={styles.profileName}>{user?.email?.split('@')[0]}</span>
                        </div>
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
