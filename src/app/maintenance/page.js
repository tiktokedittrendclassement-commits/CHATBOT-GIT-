
import styles from './page.module.css'

export default function MaintenancePage() {
    return (
        <div className={styles.container}>
            <div className={styles.decorative} />

            <div className={styles.content}>
                <div className={styles.badge}>Lancement Imminent</div>
                <h1 className={styles.logo}>VENDO</h1>
                <h2 className={styles.title}>
                    Transformez vos visiteurs en <span>clients fidèles</span> grâce à l'IA.
                </h2>
                <p className={styles.description}>
                    Vendo est la plateforme ultime pour créer des agents IA intelligents qui connaissent votre catalogue par cœur, répondent à vos clients 24/7 et automatisent vos ventes sur <strong>Shopify, WordPress et WhatsApp</strong>.
                </p>

                <div className={styles.features}>
                    <div className={styles.feature}>
                        <strong>Intelligence Totale</strong>
                        <span>L'IA apprend de vos produits en un clic.</span>
                    </div>
                    <div className={styles.feature}>
                        <strong>Vente Assistée</strong>
                        <span>Recommandations personnalisées et conclusion de ventes.</span>
                    </div>
                </div>

                <div style={{ opacity: 0.5, fontSize: '0.75rem', marginTop: '4rem' }}>
                    Vendo le bon vendeur au bon moment
                </div>
            </div>
        </div>
    )
}
