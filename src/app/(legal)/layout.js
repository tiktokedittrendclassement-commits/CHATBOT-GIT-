import styles from './legal.module.css'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function LegalLayout({ children }) {
    return (
        <div style={{ background: '#030308', minHeight: '100vh' }}>
            <div className={styles.legalWrapper}>
                <Link href="/" className={styles.backHome}>
                    <ArrowLeft size={16} />
                    Retour à l'accueil
                </Link>
                {children}
            </div>

            <footer style={{ padding: '60px 40px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>
                    © {new Date().getFullYear()} Vendo — Document légal
                </p>
            </footer>
        </div>
    )
}
