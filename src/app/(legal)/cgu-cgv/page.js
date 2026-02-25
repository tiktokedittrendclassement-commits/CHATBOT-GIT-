import styles from '../legal.module.css'

export default function CGU() {
    return (
        <>
            <h1 className={styles.title}>Conditions Générales d'Utilisation et de Vente (CGU/CGV)</h1>
            <p className={styles.lastUpdate}>Dernière mise à jour : 25 février 2026</p>

            <section className={styles.section}>
                <h2>1. Objet</h2>
                <p>
                    Les présentes conditions régissent l'utilisation du service SaaS <strong>Vendo</strong>, une plateforme de création de chatbots IA.
                </p>
            </section>

            <section className={styles.section}>
                <h2>2. Services et Abonnements</h2>
                <p>
                    Vendo propose différents plans tarifaires (Gratuit, Pro, Agence). Chaque plan définit des limites d'utilisation (nombre de chatbots, messages). L'utilisateur accepte de payer le prix correspondant au plan choisi.
                </p>
                <p>
                    Les paiements sont effectués par abonnement mensuel ou annuel. Le non-paiement peut entraîner la suspension du service.
                </p>
            </section>

            <section className={styles.section}>
                <h2>3. Responsabilité</h2>
                <p>
                    Vendo fournit un outil de génération de contenu basé sur l'IA. L'utilisateur est seul responsable du contenu diffusé par ses chatbots et de l'usage qu'il en fait. Vendo ne saurait être tenu responsable d'erreurs ou d'omissions dans les réponses générées par l'IA.
                </p>
            </section>

            <section className={styles.section}>
                <h2>4. Propriété intellectuelle</h2>
                <p>
                    La plateforme, son interface, son code et ses algorithmes sont la propriété exclusive de Vendo. L'utilisateur reste propriétaire des données d'entraînement fournies à ses chatbots.
                </p>
            </section>

            <section className={styles.section}>
                <h2>5. Droit applicable</h2>
                <p>
                    Les présentes conditions sont soumises à la loi française. En cas de litige, les tribunaux français seront seuls compétents.
                </p>
            </section>
        </>
    )
}
