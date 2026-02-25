'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import styles from './page.module.css'
import { ArrowRight, Check, X, Copy, Send, Bot, Palette, Code, Sun, Moon, MessageSquare, Zap } from 'lucide-react'
import dynamic from 'next/dynamic'

const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.1)' }}>Chargement...</div>
})

/* ─── Chat widget anime ─── */
const MSGS = [
  { r: 'bot', t: 'Bonjour 👋 Que puis-je faire pour vous ?' },
  { r: 'user', t: 'Le Hoodie Training, dispo en XL ?' },
  { r: 'bot', t: 'Oui ! Reste 3 pieces en XL : noir, gris et bleu marine.' },
  { r: 'user', t: 'Il tient chaud pour courir dehors ?' },
  { r: 'bot', t: 'Concu pour ca — DryFit 4 voies, poignets anti-vent. Efficace jusqu’à -5 °C.' },
  { r: 'user', t: 'Je prends le noir en XL.' },
  { r: 'bot', t: 'Super choix ✓  Livraison offerte des 80 € — votre panier →' },
]

function ChatWidget({ tilt }) {
  const [msgs, set] = useState([])
  const [typing, setTyping] = useState(false)
  const [i, setI] = useState(0), [loop, setLoop] = useState(0)
  const body = useRef(null)

  useEffect(() => {
    if (i >= MSGS.length) {
      const t = setTimeout(() => { set([]); setI(0); setLoop(l => l + 1) }, 3000)
      return () => clearTimeout(t)
    }
    const m = MSGS[i]
    const delay = i === 0 ? 700 : m.r === 'user' ? 950 : 400
    const t1 = setTimeout(() => {
      if (m.r === 'bot') {
        setTyping(true)
        const t2 = setTimeout(() => { setTyping(false); set(p => [...p, m]); setI(x => x + 1) }, 1100)
        return () => clearTimeout(t2)
      }
      set(p => [...p, m]); setI(x => x + 1)
    }, delay)
    return () => clearTimeout(t1)
  }, [i, loop])
  useEffect(() => { if (body.current) body.current.scrollTop = body.current.scrollHeight }, [msgs, typing])

  return (
    <div className={`${styles.widgetWrap} ${tilt ? styles.widgetTilt : ''}`}>
      <div className={styles.widgetInner}>
        <div className={styles.wHead}>
          <div className={styles.wAvatar}>V</div>
          <div>
            <p className={styles.wName}>Chatbot Vendo</p>
            <p className={styles.wSub}><span className={styles.wDot} />En ligne · repond en 3s</p>
          </div>
          <span className={styles.wX}><X size={13} /></span>
        </div>
        <div className={styles.wBody} ref={body}>
          {msgs.map((m, idx) => (
            <div key={idx} className={`${styles.bubble} ${m.r === 'user' ? styles.bU : styles.bB}`}>{m.t}</div>
          ))}
          {typing && (
            <div className={`${styles.bubble} ${styles.bB} ${styles.bTyping}`}>
              <span /><span /><span />
            </div>
          )}
        </div>
        <div className={styles.wFoot}>
          <div className={styles.wInput}>Posez votre question…</div>
          <button className={styles.wSend}><Send size={14} strokeWidth={2.5} /></button>
        </div>
      </div>
    </div>
  )
}

function MockEditor() {
  return (
    <div className={styles.mockCard}>
      <div className={styles.mockCardTitle}>
        <Bot size={18} color="var(--accent)" />
        Entraînement & Contexte
      </div>
      <div className={styles.field}>
        <label className={styles.mockLabel}>Sources de Données</label>
        <div className={styles.mockTextarea}>
          Collez le texte directement ici pour que le bot connaisse votre entreprise, vos produits et vos politiques de retour...
        </div>
        <p className={styles.mockHint}>
          Le bot utilisera ce texte pour répondre aux questions des utilisateurs.
        </p>
      </div>
    </div>
  )
}

function MockCustom() {
  return (
    <div className={styles.mockCard}>
      <div className={styles.mockCardTitle}>
        <Palette size={18} color="var(--accent)" />
        Personnalisation
      </div>
      <div className={styles.field}>
        <label className={styles.mockLabel}>Nom du Chatbot</label>
        <div className={styles.mockInput}>Mon Chatbot Vendo</div>
      </div>
      <div className={styles.field}>
        <label className={styles.mockLabel}>Sous-titre / Statut</label>
        <div className={styles.mockInput}>Expert Vendo Connecté</div>
      </div>
      <div className={styles.field}>
        <label className={styles.mockLabel}>Couleur de la marque</label>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: '#673DE6', border: '1px solid rgba(255,255,255,0.1)' }} />
          <div className={styles.mockInput} style={{ margin: 0, flex: 1 }}>#673DE6</div>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.mockLabel}>Style de l'Avatar</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#673DE6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 22, color: 'white' }}>V</span>
          </div>
          <div className={`${styles.mockBtnMini} ${styles.mockBtnMiniActive}`} style={{ margin: 0 }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 13, marginRight: 8, color: 'white' }}>V</span> Logo Vendo
          </div>
          <div className={styles.mockBtnMini} style={{ margin: 0 }}>
            Lettre
          </div>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.mockLabel}>Thème du Chatbot</label>
        <div className={styles.mockBtnGroup}>
          <div className={styles.mockBtnMini}>
            <Sun size={14} /> Mode Clair
          </div>
          <div className={`${styles.mockBtnMini} ${styles.mockBtnMiniActive}`}>
            <Moon size={14} /> Mode Sombre
          </div>
        </div>
      </div>
    </div>
  )
}

function MockBehavior() {
  return (
    <div className={styles.mockCard} style={{ maxWidth: 500, margin: '0 auto' }}>
      <div className={styles.mockCardTitle}>
        <MessageSquare size={18} color="var(--accent)" />
        Comportement
      </div>
      <div className={styles.field}>
        <label className={styles.mockLabel}>Premier Message</label>
        <div className={styles.mockTextarea} style={{ minHeight: 60 }}>Bonjour ! Comment puis-je vous aider aujourd&apos;hui ?</div>
      </div>
      <div className={styles.field}>
        <label className={styles.mockLabel}>Prompt Système</label>
        <div className={styles.mockTextarea} style={{ minHeight: 180, fontSize: 13, lineHeight: '1.6' }}>
          Tu es un assistant expert pour la boutique Vendo.
          Ton ton est chaleureux et professionnel.
          Réponds toujours en te basant sur le catalogue fourni.
        </div>
      </div>
    </div>
  )
}

function MockPopups() {
  return (
    <div className={styles.mockCard} style={{ maxWidth: 500, margin: '0 auto' }}>
      <div className={styles.mockCardTitle}>
        <Zap size={18} color="var(--accent)" />
        Popups Automatiques
      </div>
      <p className={styles.mockHint} style={{ marginBottom: 20 }}>Configurez l&apos;apparition automatique de popup</p>

      <div style={{ padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
        <label className={styles.mockLabel}>Message Proactif #1</label>
        <div className={styles.mockInput} style={{ marginBottom: 16 }}>Besoin d&apos;aide pour choisir ? 👋</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 12 }}>
          <div>
            <label className={styles.mockLabel}>Page</label>
            <div className={styles.mockInput} style={{ fontSize: 12 }}>URL</div>
          </div>
          <div>
            <label className={styles.mockLabel}>Apparition</label>
            <div className={styles.mockInput}>2s</div>
          </div>
          <div>
            <label className={styles.mockLabel}>Disparition</label>
            <div className={styles.mockInput}>10s</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MockEmbed() {
  return (
    <div className={styles.mockCard}>
      <div className={styles.mockCardTitle}>
        <Code size={18} color="var(--accent)" />
        Intégrer sur votre site
      </div>
      <p className={styles.mockHint} style={{ marginBottom: 16 }}>
        Copiez ce code dans la balise &lt;body&gt; de votre site :
      </p>
      <div className={styles.mockCodeBlock} style={{ color: '#8b5cf6' }}>
        <span style={{ color: '#E596FD' }}>&lt;script</span> <br />
        &nbsp;&nbsp;src=<span style={{ color: '#FFF' }}>"https://usevendo.com/embed.js"</span> <br />
        &nbsp;&nbsp;data-chatbot-id=<span style={{ color: '#FFF' }}>"96d933b7-cecc-42dc-a5ae-0b36da990a04"</span> <br />
        &nbsp;&nbsp;<span style={{ color: '#E596FD' }}>async</span> <br />
        <span style={{ color: '#E596FD' }}>&gt;&lt;/script&gt;</span>
      </div>
    </div>
  )
}

const PAIN = [
  ['La question de 23 h', 'Votre support est ferme. Le client veut savoir si le XL est dispo. Il achete ailleurs.'],
  ['Les 10 memes questions', '« C’est pour quelle morphologie ? » tape 30 fois par semaine par votre equipe.'],
  ['Le doute qui tue la vente', 'Un visiteur hesitant, personne pour le guider — panier abandonne. Toujours.'],
]

const CHECK_ITEMS = [
  'Repond uniquement sur ce que vous lui avez appris',
  'Connait vos stocks, tailles, coloris, delais',
  'Redirige vers le bon produit sans hesiter',
  'Ne dit jamais "je ne sais pas" sur vos propres articles',
]

const BEFORE = [
  'Question à 23 h → abandonne',
  'Email de support → reponse demain',
  'FAQ ignoree → repart sans acheter',
  'Panier plein → doute → quitte',
]

const AFTER = [
  'Question à 23 h → reponse en 3s',
  'Bot repond · equipe se repose',
  'Doute leve → "Ajouter au panier"',
  'Panier plein → converti',
]

const STEPS = [
  { n: '01', t: 'Collez votre catalogue', d: 'Produits, prix, tailles, delais, politique de retour — texte libre, aucun format impose.', Mock: MockEditor },
  { n: '02', t: 'Personnalisez le look', d: "Nom, couleur, avatar et theme. Votre assistant s'integre parfaitement à votre site.", Mock: MockCustom },
  { n: '03', t: 'Definissez le comportement', d: 'Choisissez le message d’accueil et le ton du bot pour une experience client unique.', Mock: MockBehavior },
  { n: '04', t: 'Boostez l’engagement', d: 'Configurez des popups automatiques pour capturer l’attention sur les pages cles.', Mock: MockPopups },
  { n: '05', t: 'En ligne en 3 minutes', d: 'Copiez le script, collez-le sur votre site. Compatible avec Shopify, Wix, etc.', Mock: MockEmbed },
]

const PLANS = [
  {
    n: 'Gratuit', p: '0', d: 'Testez sans engagement.',
    items: ['1 chatbot', '1 000 messages au total', 'Nom et ton personnalisables', "Script d'integration inclus"],
    fill: false, cta: 'Tester sans abonnement',
  },
  {
    n: 'Croissance', p: '49', d: 'Pour les boutiques qui veulent vendre plus.',
    items: ['10 chatbots', 'Messages illimites', 'Email marketing integre', 'Couleurs & nom sur mesure', 'Photos produits en reponse'],
    fill: true, cta: 'Demarrer maintenant',
  },
  {
    n: 'Agence', p: '249', d: 'Gerez plusieurs clients sous votre marque.',
    items: ['Chatbots illimites', 'Messages illimites', 'WhatsApp marketing', 'Marque blanche complète', 'Droits de revente'],
    fill: false, cta: 'Demarrer maintenant',
  },
]

export default function Home() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  return (
    <div className={styles.page}>

      <header className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}>
        <div className={styles.navWrap}>
          <Link href="/" className={styles.logo}>Vendo</Link>
          <div className={styles.navLinks}>
            <Link href="#how" className={styles.navA}>Fonctionnement</Link>
            <Link href="#pricing" className={styles.navA}>Tarifs</Link>
          </div>
          <div className={styles.navEnd}>
            <Link href="/login" className={styles.navLogin}>Connexion</Link>
            <Link href="/register" className={styles.btnNav}>Commencer</Link>
          </div>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroGrid3D} aria-hidden><div className={styles.grid3DPlane} /></div>
        <div className={styles.heroMesh} aria-hidden />
        <div className={styles.heroOrb} aria-hidden />

        <div className={styles.heroLayout}>
          <div className={styles.heroLeft}>
            <p className={styles.eyebrow}>Chatbot IA pour tout site & application</p>
            <h1 className={styles.h1}>
              Vos clients posent<br />
              des questions.<br />
              <span className={styles.h1Accent}>Votre chatbot y repond.</span>
            </h1>
            <p className={styles.heroPara}>
              Vendo entraine un assistant sur votre catalogue exact.
              Tailles, stocks, delais, retours — il repond à la place
              de votre equipe, 24 h/24, sans jamais inventer.
            </p>
            <div className={styles.heroCtaRow}>
              <Link href="/register" className={styles.btnFill}>
                Tester sans abonnement
                <ArrowRight size={15} strokeWidth={2.5} />
              </Link>
            </div>
            <p className={styles.heroMeta}>Compatible Shopify · WordPress · Wix · Tout site custom</p>
          </div>
          <div className={styles.heroRight}>
            <div className={styles.ring} aria-hidden />
            <div className={styles.ring2} aria-hidden />
            <ChatWidget tilt />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={`${styles.wrap} ${styles.splitBlock}`}>
          <div className={styles.splitL}>
            <p className={styles.eyebrow} style={{ color: '#f87171' }}>Ce qui vous coute des ventes</p>
            <h2 className={styles.h2}>
              Une question sans reponse{'\n'}= une vente perdue.
            </h2>
            <p className={styles.blockSub}>
              82 % des abandons de panier surviennent quand le visiteur
              ne trouve pas de reponse à une question simple.
            </p>
          </div>
          <div className={styles.splitR}>
            {PAIN.map(([t, d], idx) => (
              <div key={idx} className={styles.painCard}>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.mascotSection} id="features">
        <div className={styles.wrap}>
          <div className={styles.mascotGrid}>
            <div className={styles.mascotVisual}>
              <div className={styles.visualGlow} />
              <div className={styles.mascotScene}>
                <Spline
                  scene="https://prod.spline.design/8wOkDeeTiFGP4p7b/scene.splinecode"
                  onLoad={(spline) => {
                    try { if (spline && spline.setZoom) spline.setZoom(1); } catch (e) { }
                  }}
                />
                <div className={styles.watermarkCover} />
              </div>
            </div>

            <div className={styles.mascotContent}>
              <p className={styles.eyebrow} style={{ color: 'var(--accent)', fontWeight: 600 }}>Ce que fait Vendo</p>
              <h1 className={styles.mascotHeadline}>Un bot entraîné sur vos produits.</h1>

              <div className={styles.mascotStage}>
                <div className={styles.glassSlate}>
                  <span className={styles.slateTitle} style={{ color: '#f87171' }}>Avant Vendo</span>
                  <div className={styles.slateItems}>
                    <div className={styles.slateItem}>
                      <X size={14} color="#f87171" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span>Question à 23h → <span className={styles.slateValue}>Vente perdue</span></span>
                    </div>
                    <div className={styles.slateItem}>
                      <X size={14} color="#f87171" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span>Email de support → <span className={styles.slateValue}>Délai 24h+</span></span>
                    </div>
                    <div className={styles.slateItem}>
                      <X size={14} color="#f87171" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span>FAQ ignorée → <span className={styles.slateValue}>Abandon panier</span></span>
                    </div>
                  </div>
                </div>

                <div className={`${styles.glassSlate} ${styles.glassSlateAccent}`}>
                  <span className={styles.slateTitle} style={{ color: 'var(--accent)' }}>Avec Vendo</span>
                  <div className={styles.slateItems}>
                    <div className={styles.slateItem}>
                      <Check size={14} color="var(--accent)" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span>Réponse en 3s → <span className={styles.slateValue}>Conversion immédiate</span></span>
                    </div>
                    <div className={styles.slateItem}>
                      <Check size={14} color="var(--accent)" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span>Bot expert → <span className={styles.slateValue}>Équipe libérée</span></span>
                    </div>
                    <div className={styles.slateItem}>
                      <Check size={14} color="var(--accent)" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span>Doute levé → <span className={styles.slateValue}>Panier validé</span></span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.mascotCta} style={{ marginTop: 40 }}>
                <Link href="/register" className={styles.btnFill}>
                  Tester sur ma boutique <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className={styles.section}>
        <div className={styles.wrap}>
          <div className={styles.centerHead}>
            <p className={styles.eyebrow}>Mise en place</p>
            <h2 className={styles.h2c}>En ligne en 3 minutes.</h2>
            <p className={styles.centerSub}>
              Aucun developpeur. Aucune formation. Voyez exactement ce que vous aurez à faire.
            </p>
          </div>

          {STEPS.map((s, idx) => (
            <div
              key={s.n}
              className={`${styles.stepRow} ${idx % 2 === 1 ? styles.stepRowReverse : ''}`}
            >
              <div className={styles.stepText}>
                <span className={styles.stepN}>{s.n}</span>
                <h3 className={styles.stepT}>{s.t}</h3>
                <p className={styles.stepD}>{s.d}</p>
              </div>
              <div className={styles.stepVisual}>
                {s.img ? (
                  <div className={styles.stepImgWrapper}>
                    <img src={s.img} alt={s.t} className={styles.stepImg} />
                  </div>
                ) : (
                  <s.Mock />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className={styles.section}>
        <div className={styles.wrap}>
          <div className={styles.centerHead}>
            <p className={styles.eyebrow}>Tarification</p>
            <h2 className={styles.h2c}>Gratuit pour tester. Payant quand ca convertit.</h2>
            <p className={styles.centerSub}>
              Environ <strong>0,0001 € par message</strong> — moins d’1 € pour 10 000 conversations.
            </p>
          </div>
          <div className={styles.plans}>
            {PLANS.map((p, i) => (
              <div key={i} className={`${styles.plan} ${p.fill ? styles.planFill : ''}`}>
                {p.fill && <div className={styles.planBadge}>Le plus populaire</div>}
                <p className={styles.planName}>{p.n}</p>
                <div className={styles.planPrice}>
                  <span className={styles.planNum}>{p.p}€</span>
                  <span className={styles.planFreq}>/mois</span>
                </div>
                <p className={styles.planDesc}>{p.d}</p>
                <ul className={styles.planList}>
                  {p.items.map(it => <li key={it}><Check size={13} strokeWidth={3} /><span>{it}</span></li>)}
                </ul>
                <Link href="/register" className={p.fill ? styles.planBtnFill : styles.planBtnLine}>{p.cta}</Link>
              </div>
            ))}
          </div>

        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaGlow} aria-hidden />
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaH}>
            La prochaine question de vos clients<br />
            peut trouver sa reponse ce soir.
          </h2>
          <p className={styles.ctaSub}>Sans dev. En 3 minutes.</p>
          <Link href="/register" className={styles.btnFillLg}>
            Creer mon chatbot maintenant
            <ArrowRight size={17} strokeWidth={2.5} />
          </Link>
          <p className={styles.ctaMeta}>Compatible Shopify · WordPress · Wix · Tout site custom</p>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerWrap}>
          <span className={styles.logo}>Vendo</span>
          <div className={styles.footerLinks}>
            <Link href="/login">Connexion</Link>
            <Link href="#how">Fonctionnement</Link>
            <Link href="#pricing">Tarifs</Link>
            <Link href="/mentions-legales">Mentions Légales</Link>
            <Link href="/politique-de-confidentialite">Confidentialité</Link>
            <Link href="/cgu-cgv">CGU/CGV</Link>
            <Link href="/politique-de-remboursement">Remboursement</Link>
          </div>
          <span className={styles.footerCopy}>© {new Date().getFullYear()} Vendo</span>
        </div>
      </footer>

    </div>
  )
}
