
import Link from 'next/link'
import styles from './page.module.css'
import { Bot, Zap, Globe, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DemoStore from '@/components/demo-store'

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.logo}>Vendo</div>
        <div className={styles.navLinks}>
          <Link href="/login">Connexion</Link>
          <Link href="/register">
            <Button>Commencer</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badgeLine}>
            <span>Nouveau : Vendo v2.0 est arrivé ✨</span>
          </div>
          <h1 className={styles.title}>
            Chatbots IA pour <span className={styles.highlight}>Shopify</span> & <span className={styles.highlight}>WordPress</span>
          </h1>
          <div className={styles.tagline}>
            "Le bon vendeur, au bon moment."
          </div>
          <p className={styles.subtitle}>
            Créez des assistants IA personnalisés en quelques minutes. Augmentez vos ventes, automatisez le support et engagez vos visiteurs 24/7.
          </p>
          <div className={styles.heroButtons}>
            <Link href="/register">
              <Button size="lg" className={styles.ctaBtn}>Commencer gratuitement</Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className={styles.secondaryBtn}>Comment ça marche</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Features */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionHeader}>
          <h2>Pourquoi Vendo ?</h2>
          <p>Tout ce dont vous avez besoin pour automatiser votre service client.</p>
        </div>

        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <Bot size={48} className={styles.featureIcon} />
            <h3>Entraînement IA Personnalisé</h3>
            <p>Entraînez votre bot sur vos propres produits et politiques simplement en collant du texte.</p>
          </div>
          <div className={styles.featureCard}>
            <Globe size={48} className={styles.featureIcon} />
            <h3>Fonctionne Partout</h3>
            <p>Intégrez sur Shopify, WordPress, Wix ou tout site web personnalisé avec une seule ligne de code.</p>
          </div>
          <div className={styles.featureCard}>
            <Zap size={48} className={styles.featureIcon} />
            <h3>Installation Instantanée</h3>
            <p>Aucune compétence technique requise. Créez votre premier bot en moins de 2 minutes.</p>
          </div>
        </div>
      </section>

      {/* DEMO SECTION */}
      <section className={styles.demoSection}>
        <div className={styles.demoContainer}>
          <div className={styles.sectionHeader}>
            <h2>Testez une "Vraie" Intégration</h2>
            <p>
              Voici une boutique de démonstration. Cliquez sur un produit, et voyez comment le chatbot (en bas à droite) connaît le contexte et aide à la vente.
            </p>
          </div>

          <div className={styles.demoWrapper}>
            <DemoStore />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className={styles.pricing}>
        <div className={styles.sectionHeader}>
          <h2>Tarification Simple</h2>
          <p>Choisissez le plan adapté à votre activité.</p>
          <div className={styles.pricingNote}>
            💡 <strong>Note :</strong> Les abonnements couvrent les fonctionnalités.
            La consommation de l'IA est payée à l'usage : <strong>~0.0001€ / message</strong>.
          </div>
        </div>

        <div className={styles.pricingGrid}>
          {/* Free Plan */}
          <div className={styles.pricingCard}>
            <div className={styles.planName}>Gratuit</div>
            <div className={styles.price}>0€<span>/mo</span></div>
            <ul className={styles.planFeatures}>
              <li><Check size={16} /> 1 Chatbot</li>
              <li><Check size={16} /> 1000 messages/mois</li>
              <li><Check size={16} /> Personnalisation Basique</li>
              <li><Check size={16} /> Support Communautaire</li>
            </ul>
            <Link href="/register">
              <Button variant="outline" className={styles.planBtn}>Commencer Gratuitement</Button>
            </Link>
          </div>

          {/* Pro Plan */}
          <div className={`${styles.pricingCard} ${styles.popular}`}>
            <div className={styles.popularBadge}>Le Plus Populaire</div>
            <div className={styles.planName}>Croissance</div>
            <div className={styles.price}>49€<span>/mo</span></div>
            <ul className={styles.planFeatures}>
              <li><Check size={16} /> 10 Chatbots</li>
              <li><Check size={16} /> Messages illimités</li>
              <li><Check size={16} /> Email Marketing</li>
              <li><Check size={16} /> Nom du Bot Personnalisé</li>
              <li><Check size={16} /> Photos Produits</li>
            </ul>
            <Link href="/register">
              <Button variant="primary" className={styles.planBtn}>Choisir Croissance</Button>
            </Link>
          </div>

          {/* Agency Plan */}
          <div className={styles.pricingCard}>
            <div className={styles.planName}>Agence</div>
            <div className={styles.price}>249€<span>/mo</span></div>
            <ul className={styles.planFeatures}>
              <li><Check size={16} /> Chatbots illimités</li>
              <li><Check size={16} /> Messages illimités</li>
              <li><Check size={16} /> Marketing WhatsApp</li>
              <li><Check size={16} /> Marque Blanche</li>
              <li><Check size={16} /> Droits de Revente</li>
            </ul>
            <Link href="/register">
              <Button variant="outline" className={styles.planBtn}>Choisir Agence</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div>&copy; {new Date().getFullYear()} Vendo. Tous droits réservés.</div>
      </footer>
    </div>
  )
}
