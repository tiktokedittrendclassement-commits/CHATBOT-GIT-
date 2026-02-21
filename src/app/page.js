'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import styles from './page.module.css'
import { ArrowRight, Check, X, Copy, SendHorizontal } from 'lucide-react'
import dynamic from 'next/dynamic'
import GymsharkDemo from '@/components/gymshark-demo'

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
      <div className={styles.chrome}>
        <div className={styles.dots}><span /><span /><span /></div>
        <div className={styles.urlBar}>votreboutique.com</div>
      </div>
      <div className={styles.widgetInner}>
        <div className={styles.wHead}>
          <div className={styles.wAvatar}>V</div>
          <div>
            <p className={styles.wName}>Assistant Vendo</p>
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
          <button className={styles.wSend}><SendHorizontal size={14} strokeWidth={2.5} /></button>
        </div>
      </div>
    </div>
  )
}

/* ─── Mockup Step 1 : editeur de catalogue ─── */
function MockEditor() {
  return (
    <div className={styles.mockBox}>
      <div className={styles.mockHead}>
        <div className={styles.mockDots}><span /><span /><span /></div>
        <span className={styles.mockTitle}>Votre catalogue — editeur Vendo</span>
      </div>
      <div className={styles.mockEditorBody}>
        <p className={styles.mLine}><span className={styles.mProp}>Produit</span> Hoodie Training Pro</p>
        <p className={styles.mLine}><span className={styles.mProp}>Prix</span> 89,99 €</p>
        <p className={styles.mLine}><span className={styles.mProp}>Tailles</span> S · M · L · XL</p>
        <p className={styles.mLine}><span className={styles.mProp}>Couleurs</span> Noir · Gris · Marine</p>
        <p className={styles.mLine}><span className={styles.mProp}>Livraison</span> sous 48 h</p>
        <p className={styles.mLine}><span className={styles.mProp}>Retours</span> gratuits 30 jours</p>
        <span className={styles.cursor} />
      </div>
      <div className={styles.mockFoot}>
        <Check size={12} color="#34d399" />
        <span>847 elements enregistres · Pret a repondre</span>
      </div>
    </div>
  )
}

/* ─── Mockup Step 2 : personnalisation ─── */
function MockCustom() {
  return (
    <div className={styles.mockBox}>
      <div className={styles.mockHead}>
        <div className={styles.mockDots}><span /><span /><span /></div>
        <span className={styles.mockTitle}>Personnalisation</span>
      </div>
      <div className={styles.mockCustomBody}>
        <div className={styles.mockCustomLeft}>
          <div className={styles.mockField}>
            <label>Nom du bot</label>
            <div className={styles.mockInput}>Assistant SportZone</div>
          </div>
          <div className={styles.mockField}>
            <label>Message d’accueil</label>
            <div className={styles.mockInput} style={{ fontSize: 11 }}>Bonjour, comment puis-je vous aider ?</div>
          </div>
          <div className={styles.mockField}>
            <label>Couleur principale</label>
            <div className={styles.swatches}>
              {['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'].map(c => (
                <span key={c} className={styles.swatch} style={{ background: c, outline: c === '#7c3aed' ? '2px solid #fff' : 'none' }} />
              ))}
            </div>
          </div>
        </div>
        <div className={styles.mockCustomRight}>
          <p className={styles.mockPreviewLabel}>Aperçu</p>
          <div className={styles.miniWidget}>
            <div className={styles.miniHead}>
              <div className={styles.miniAv}>S</div>
              <span>Assistant SportZone</span>
            </div>
            <div className={styles.miniMsg}>Bonjour, comment puis-je vous aider ?</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Mockup Step 3 : integration ─── */
function MockEmbed() {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => { setCopied(true); setTimeout(() => setCopied(false), 1600) }
  return (
    <div className={styles.mockBox}>
      <div className={styles.mockHead}>
        <div className={styles.mockDots}><span /><span /><span /></div>
        <span className={styles.mockTitle}>Votre script d’integration</span>
      </div>
      <div className={styles.mockEmbedBody}>
        <div className={styles.codeRow}>
          <code className={styles.codeSnip}>
            {'<script src="https://vendo.ai/bot.js"'}
            <br />
            {'  data-id="bot_x7k2m"></script>'}
          </code>
          <button className={styles.copyBtn} onClick={handleCopy}>
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copie !' : 'Copier'}
          </button>
        </div>
        <div className={styles.embedArrow}>↓ Collez avant &lt;/body&gt;</div>
        <div className={styles.siteMini}>
          <div className={styles.siteMiniHead}>
            <div className={styles.siteMiniDots}><span /><span /><span /></div>
            <span className={styles.siteMiniUrl}>votreboutique.com</span>
          </div>
          <div className={styles.siteMiniBody}>
            <div className={styles.siteFakeContent}>
              <div className={styles.fakeLine} style={{ width: '70%' }} />
              <div className={styles.fakeLine} style={{ width: '50%' }} />
              <div className={styles.fakeLine} style={{ width: '60%' }} />
            </div>
            <div className={styles.widgetBubble}>
              <span>V</span>
            </div>
          </div>
        </div>
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
  { n: '02', t: 'Personnalisez votre bot', d: "Nom, couleur, message d’accueil. Vos clients parlent à votre marque, pas à un outil generique.", Mock: MockCustom },
  { n: '03', t: 'Une ligne de code', d: 'Copiez le script, collez-le avant la balise de fermeture. Compatible tout CMS.', Mock: MockEmbed },
]

const PLANS = [
  {
    n: 'Gratuit', p: '0', d: 'Testez sans engagement.',
    items: ['1 chatbot', '1 000 messages au total', 'Nom et ton personnalisables', "Script d'integration inclus"],
    fill: false, cta: 'Tester gratuitement',
  },
  {
    n: 'Croissance', p: '49', d: 'Pour les boutiques qui veulent vendre plus.',
    items: ['10 chatbots', 'Messages illimites', 'Email marketing integre', 'Couleurs & nom sur mesure', 'Photos produits en reponse'],
    fill: true, cta: 'Demarrer maintenant',
  },
  {
    n: 'Agence', p: '249', d: 'Gerez plusieurs clients sous votre marque.',
    items: ['Chatbots illimites', 'Messages illimites', 'WhatsApp marketing', 'Marque blanche complète', 'Droits de revente'],
    fill: false, cta: "Contacter l’equipe",
  },
]

export default function Home() {
  return (
    <div className={styles.page}>

      <header className={styles.nav}>
        <div className={styles.navWrap}>
          <Link href="/" className={styles.logo}>Vendo</Link>
          <div className={styles.navLinks}>
            <Link href="#how" className={styles.navA}>Fonctionnement</Link>
            <Link href="#demo" className={styles.navA}>Demo</Link>
            <Link href="#pricing" className={styles.navA}>Tarifs</Link>
          </div>
          <div className={styles.navEnd}>
            <Link href="/login" className={styles.navLogin}>Connexion</Link>
            <Link href="/register" className={styles.btnNav}>Commencer gratuitement</Link>
          </div>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroGrid3D} aria-hidden><div className={styles.grid3DPlane} /></div>
        <div className={styles.heroMesh} aria-hidden />
        <div className={styles.heroOrb} aria-hidden />

        <div className={styles.heroLayout}>
          <div className={styles.heroLeft}>
            <p className={styles.eyebrow}>Chatbot IA pour boutiques e-commerce</p>
            <h1 className={styles.h1}>
              Vos clients posent<br />
              des questions.<br />
              <span className={styles.h1Accent}>Votre bot y repond.</span>
            </h1>
            <p className={styles.heroPara}>
              Vendo entraine un assistant sur votre catalogue exact.
              Tailles, stocks, delais, retours — il repond à la place
              de votre equipe, 24 h/24, sans jamais inventer.
            </p>
            <div className={styles.heroCtaRow}>
              <Link href="/register" className={styles.btnFill}>
                Tester gratuitement — sans carte
                <ArrowRight size={15} strokeWidth={2.5} />
              </Link>
              <Link href="#demo" className={styles.btnText}>{"Voir la demo ↓"}</Link>
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

      <section className={styles.section} style={{ background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
        <div className={styles.mascotFeatures}>
          <Spline
            scene="https://prod.spline.design/8wOkDeeTiFGP4p7b/scene.splinecode"
            onLoad={(spline) => {
              // Ensure the scene is properly initialized
              try {
                if (spline && spline.setZoom) spline.setZoom(1);
              } catch (e) {
                console.warn('Spline initialization check:', e);
              }
            }}
            onError={(e) => {
              console.warn('Spline loading error:', e);
            }}
          />
          <div className={styles.watermarkCover} />
        </div>
        <div className={`${styles.wrap} ${styles.splitBlock}`}>
          <div className={styles.splitL}>
            <p className={styles.eyebrow} style={{ color: '#34d399' }}>Ce que fait Vendo</p>
            <h2 className={styles.h2}>Un bot entraîné{'\n'}sur vos produits.</h2>
            <ul className={styles.checks}>
              {CHECK_ITEMS.map(t => (
                <li key={t}><Check size={14} strokeWidth={3} /><span>{t}</span></li>
              ))}
            </ul>
            <Link href="/register" className={styles.btnFill}>
              Tester sur ma boutique — gratuit <ArrowRight size={14} />
            </Link>
          </div>
          <div className={styles.splitR}>
            <div className={styles.compareGrid}>
              <div className={styles.compareCol}>
                <p className={styles.compLabel} style={{ color: '#f87171' }}>Avant Vendo</p>
                {BEFORE.map(t => (
                  <div key={t} className={`${styles.compRow} ${styles.rowRed}`}>
                    <X size={12} color="#f87171" style={{ flexShrink: 0 }} /><span>{t}</span>
                  </div>
                ))}
              </div>
              <div className={styles.compareCol}>
                <p className={styles.compLabel} style={{ color: '#34d399' }}>Avec Vendo</p>
                {AFTER.map(t => (
                  <div key={t} className={`${styles.compRow} ${styles.rowGreen}`}>
                    <Check size={12} color="#34d399" style={{ flexShrink: 0 }} /><span>{t}</span>
                  </div>
                ))}
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
                <s.Mock />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="demo" className={styles.section} style={{ background: 'var(--surface)' }}>
        <div className={styles.wrap}>
          <div className={styles.centerHead}>
            <p className={styles.eyebrow}>Demo interactive</p>
            <h2 className={styles.h2c}>Essayez-le vous-même.</h2>
            <p className={styles.centerSub}>
              Demandez une taille, un delai, une comparaison produit.
              C’est exactement ce que verront vos clients.
            </p>
          </div>
          <div className={styles.demoBox}>
            <GymsharkDemo />
          </div>
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
          <div className={styles.trustRow}>
            {['🔒 Hebergement Europe', '✅ Conforme RGPD', '⚡ Sans engagement'].map(b => (
              <span key={b} className={styles.trustBadge}>{b}</span>
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
          <p className={styles.ctaSub}>Sans carte. Sans dev. En 3 minutes.</p>
          <Link href="/register" className={styles.btnFillLg}>
            Creer mon assistant maintenant
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
          </div>
          <span className={styles.footerCopy}>© {new Date().getFullYear()} Vendo</span>
        </div>
      </footer>

    </div>
  )
}
