import styles from '../legal.module.css'

export default function MentionsLegales() {
    return (
        <>
            <h1 className={styles.title}>Mentions Légales</h1>
            <p className={styles.lastUpdate}>Dernière mise à jour : 25 février 2026</p>

            <section className={styles.section}>
                <h2>1. Présentation du site</h2>
                <p>
                    En vertu de l'article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique, il est précisé aux utilisateurs du site <strong>Vendo</strong> l'identité des différents intervenants dans le cadre de sa réalisation et de son suivi :
                </p>
                <p>
                    <strong>Propriétaire / Éditeur :</strong><br />
                    [Nom de votre Entreprise / Nom Propre]<br />
                    [Adresse du siège social]<br />
                    SIRET : [Votre Numéro SIRET]<br />
                    Responsable de la publication : [Votre Nom]
                </p>
            </section>

            <section className={styles.section}>
                <h2>2. Hébergement</h2>
                <p>
                    Le site est hébergé par :<br />
                    <strong>Vercel Inc.</strong><br />
                    440 N Barranca Ave #4133<br />
                    Covina, CA 91723<br />
                    États-Unis
                </p>
            </section>

            <section className={styles.section}>
                <h2>3. Propriété intellectuelle</h2>
                <p>
                    L'éditeur est propriétaire des droits de propriété intellectuelle ou détient les droits d'usage sur tous les éléments accessibles sur le site, notamment les textes, images, graphismes, logo, icônes, sons, logiciels.
                </p>
                <p>
                    Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de l'éditeur.
                </p>
            </section>

            <section className={styles.section}>
                <h2>4. Données personnelles</h2>
                <p>
                    Les informations recueillies sur ce site font l'objet d'un traitement informatique destiné à la gestion de la clientèle et à l'amélioration de nos services. Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification et de suppression des données vous concernant.
                </p>
            </section>
        </>
    )
}
