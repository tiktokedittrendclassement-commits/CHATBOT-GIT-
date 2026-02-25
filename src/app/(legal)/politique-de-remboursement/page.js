import styles from '../legal.module.css'

export default function Remboursement() {
    return (
        <>
            <h1 className={styles.title}>Politique de Remboursement</h1>
            <p className={styles.lastUpdate}>Dernière mise à jour : 25 février 2026</p>

            <section className={styles.section}>
                <h2>1. Services Numériques</h2>
                <p>
                    Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne peut être exercé pour les services dont l'exécution a commencé après accord préalable exprès du consommateur et renoncement exprès à son droit de rétractation.
                </p>
            </section>

            <section className={styles.section}>
                <h2>2. Demande de Remboursement</h2>
                <p>
                    Étant donné la nature immédiate de l'accès aux services SaaS (crédits IA, fonctionnalités premium), nous n'offrons généralement pas de remboursement après que le service a été utilisé ou après la période d'essai gratuite.
                </p>
                <p>
                    Toutefois, chaque demande sera étudiée au cas par cas. Si vous rencontrez un problème technique majeur empêchant l'utilisation du service, contactez notre support dans les 7 jours suivant votre achat.
                </p>
            </section>

            <section className={styles.section}>
                <h2>3. Annulation</h2>
                <p>
                    Vous pouvez annuler votre abonnement à tout moment via votre tableau de bord (section Facturation). L'annulation prendra effet à la fin de la période de facturation en cours. Aucun remboursement partiel ne sera accordé pour le mois commencé.
                </p>
            </section>
        </>
    )
}
