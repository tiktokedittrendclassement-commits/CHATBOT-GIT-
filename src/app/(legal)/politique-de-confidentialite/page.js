import styles from '../legal.module.css'

export default function PolitiqueConfidentialite() {
    return (
        <>
            <h1 className={styles.title}>Politique de Confidentialité</h1>
            <p className={styles.lastUpdate}>Dernière mise à jour : 25 février 2026</p>

            <section className={styles.section}>
                <h2>1. Collecte des données</h2>
                <p>Nous collectons les informations suivantes lors de votre utilisation de Vendo :</p>
                <ul className={styles.list}>
                    <li>Informations de compte (Email, Nom) via Supabase Auth.</li>
                    <li>Données de configuration de votre chatbot.</li>
                    <li>Historique des conversations de vos chatbots (pour l'analyse et l'amélioration des réponses).</li>
                    <li>Données de paiement (gérées par notre prestataire de paiement sécurisé).</li>
                </ul>
            </section>

            <section className={styles.section}>
                <h2>2. Utilisation des données</h2>
                <p>Vos données sont utilisées exclusivement pour :</p>
                <ul className={styles.list}>
                    <li>Fournir et gérer votre accès au service Vendo.</li>
                    <li>Personnaliser l'expérience de vos utilisateurs.</li>
                    <li>Assurer le support technique.</li>
                    <li>Respecter nos obligations légales et réglementaires.</li>
                </ul>
            </section>

            <section className={styles.section}>
                <h2>3. Conservation des données</h2>
                <p>
                    Nous conservons vos données personnelles tant que votre compte est actif ou pour la durée nécessaire à la fourniture de nos services. Les données de conversation sont conservées pendant toute la durée de vie du chatbot, sauf suppression manuelle par l'utilisateur.
                </p>
            </section>

            <section className={styles.section}>
                <h2>4. Vos droits (RGPD)</h2>
                <p>Conformément au RGPD, vous bénéficiez des droits suivants :</p>
                <ul className={styles.list}>
                    <li>Droit d'accès et de rectification.</li>
                    <li>Droit à l'effacement de vos données.</li>
                    <li>Droit à la portabilité des données.</li>
                    <li>Droit d'opposition au traitement.</li>
                </ul>
                <p>Pour exercer ces droits, contactez-nous à l'adresse email de support.</p>
            </section>

            <section className={styles.section}>
                <h2>5. Cookies</h2>
                <p>
                    Vendo utilise des cookies techniques essentiels au bon fonctionnement de l'application (sessions auth) et des cookies analytiques anonymisés.
                </p>
            </section>
        </>
    )
}
