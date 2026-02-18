'use client'

import { useState, useEffect, useRef } from 'react'
import DemoChatStore from '@/components/demo-chat-store'
import { NATUREL_DATA } from '@/data/naturel-data'

// --- ASSETS & DATA FROM USER FILE ---
const PRODUCTS = [
    { id: 1, name: 'Sérum Acide Hyaluronique', short: 'Hydratation intense', category: 'serum', label: 'Visage', price: 16.9, badge: 'bestseller', pct: '3%', tag: 'visage', ingredients: ['Acide hyaluronique 3%', 'Provitamine B5', 'Eau thermale'], image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80' },
    { id: 2, name: 'Sérum Niacinamide', short: 'Pores affinés, éclat unifié', category: 'serum', label: 'Visage', price: 14.9, badge: 'new', pct: '10%', tag: 'visage', ingredients: ['Niacinamide 10%', 'Zinc PCA', 'Aloe vera'], image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?w=800&q=80' },
    { id: 3, name: 'Crème Hydratante Légère', short: 'Texture gel, toutes peaux', category: 'creme', label: 'Visage', price: 22.9, badge: null, pct: '', tag: 'visage', ingredients: ['Beurre de karité', 'Squalane', 'Allantoïne'], image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=800&q=80' },
    { id: 4, name: 'Sérum Vitamine C', short: 'Éclat & protection antioxydante', category: 'serum', label: 'Visage', price: 18.9, badge: null, pct: '10%', tag: 'visage', ingredients: ['Vitamine C 10%', 'Vitamine E', 'Acide férulique'], image: 'https://images.unsplash.com/photo-1556228720-1957be99119d?w=800&q=80' },
    { id: 5, name: 'Huile Sèche Corps', short: 'Légère, non grasse, absorbée', category: 'corps', label: 'Corps', price: 19.9, badge: null, pct: '', tag: 'corps', ingredients: ['Squalane végétal', 'Jojoba', 'Argan bio'], image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=800&q=80' },
    { id: 6, name: 'Masque Argile Verte', short: 'Détox & pores nettoyés', category: 'visage', label: 'Visage', price: 12.9, badge: null, pct: '', tag: 'visage', ingredients: ['Argile verte', 'Charbon actif', 'Acide salicylique 1%'], image: 'https://images.unsplash.com/photo-1571781565036-d3f7527ce721?w=800&q=80' },
    { id: 7, name: 'Rétinol 0.5%', short: 'Anti-âge progressif', category: 'serum', label: 'Visage', price: 24.9, badge: null, pct: '0.5%', tag: 'visage', ingredients: ['Rétinol vegan 0.5%', 'Squalane', 'Vitamine E'], image: 'https://images.unsplash.com/photo-1620917670393-27339d0dc6b5?w=800&q=80' },
    { id: 8, name: 'Huile Capillaire Réparatrice', short: 'Brillance & nutrition', category: 'cheveux', label: 'Cheveux', price: 15.9, badge: 'new', pct: '', tag: 'cheveux', ingredients: ['Huile de ricin', 'Kératine vegan', 'Argane bio'], image: 'https://images.unsplash.com/photo-1526947425960-94d046f43771?w=800&q=80' },
]

const TESTIMONIALS = [
    { text: 'Ma peau est transformée en 3 semaines. Le sérum niacinamide a effacé mes pores visibles, je n\'en reviens pas.', author: 'Sophie M., Paris', stars: 5 },
    { text: 'Enfin une marque qui affiche vraiment ses concentrations. Je fais confiance à Naturel les yeux fermés.', author: 'Thomas R., Lyon', stars: 5 },
    { text: 'L\'acide hyaluronique est le meilleur que j\'aie jamais utilisé. Ma peau est plump dès le matin.', author: 'Léa B., Bordeaux', stars: 5 },
    { text: 'Minimaliste, efficace, responsable. Tout ce que j\'attendais d\'une marque de soins française.', author: 'Camille D., Nantes', stars: 5 },
    { text: 'Le rétinol est parfait pour débuter, pas d\'irritation et des résultats visibles sur les ridules.', author: 'Marie F., Toulouse', stars: 5 },
    { text: 'Packaging sobre et élégant, formules ultra efficaces. J\'ai converti toutes mes amies.', author: 'Julie P., Marseille', stars: 5 },
]

// --- USER CSS ---
const CSS_STYLES = `
    /* ---- RESET & BASE ---- */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --black: #0f0f0f;
      --white: #fafaf8;
      --cream: #f5f0e8;
      --beige: #e8ddd0;
      --amber: #c8a882;
      --gray: #6b6b6b;
      --light-gray: #e0dbd4;
      --font-serif: 'Cormorant Garamond', Georgia, serif;
      --font-sans: 'DM Sans', sans-serif;
    }
    .naturel-demo {
        position: relative;
        height: 100%;
        overflow: hidden;
    }
    .demo-container { 
        font-family: var(--font-sans);
        background: var(--white);
        color: var(--black);
        font-size: 15px;
        line-height: 1.6;
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        position: relative;
    }
    .demo-container a { text-decoration: none; color: inherit; }
    .demo-container img { display: block; max-width: 100%; }
    .demo-container button { cursor: pointer; border: none; background: none; font-family: var(--font-sans); }
    
    /* ---- TOP BANNER ---- */
    .top-banner { background: var(--black); color: var(--white); text-align: center; padding: 10px 20px; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; }

    /* ---- NAV ---- */
    .demo-nav { position: sticky; top: 0; z-index: 100; background: var(--white); border-bottom: 1px solid var(--light-gray); display: flex; align-items: center; justify-content: space-between; padding: 0 48px; height: 64px; transition: box-shadow 0.3s; }
    .demo-nav.scrolled { box-shadow: 0 2px 20px rgba(0,0,0,0.06); }
    .nav-logo { font-family: var(--font-serif); font-size: 26px; font-weight: 300; letter-spacing: 0.08em; text-transform: uppercase; }
    .nav-links { display: flex; gap: 32px; }
    .nav-links div { font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--black); position: relative; padding-bottom: 2px; cursor: pointer; }
    .nav-links div::after { content: ''; position: absolute; bottom: 0; left: 0; width: 0; height: 1px; background: var(--black); transition: width 0.3s; }
    .nav-links div:hover::after { width: 100%; }
    .nav-actions { display: flex; gap: 20px; align-items: center; }
    .nav-actions button { font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--gray); transition: color 0.2s; }
    .nav-actions button:hover { color: var(--black); }
    .cart-btn { background: var(--black) !important; color: var(--white) !important; padding: 8px 18px; font-size: 11px !important; letter-spacing: 0.1em; position: relative; }
    .cart-count { background: var(--amber); color: var(--white); border-radius: 50%; width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; margin-left: 6px; }

    /* ---- HERO ---- */
    .hero { display: grid; grid-template-columns: 1fr 1fr; min-height: 600px; }
    .hero-text { display: flex; flex-direction: column; justify-content: center; padding: 80px 64px 80px 80px; background: var(--cream); }
    .hero-eyebrow { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gray); margin-bottom: 24px; }
    .hero-title { font-family: var(--font-serif); font-size: clamp(52px, 6vw, 88px); font-weight: 300; line-height: 1.05; margin-bottom: 32px; color: var(--black); }
    .hero-title em { font-style: italic; color: var(--amber); }
    .hero-sub { font-size: 15px; color: var(--gray); max-width: 380px; line-height: 1.8; margin-bottom: 48px; }
    .hero-ctas { display: flex; gap: 16px; align-items: center; }
    .btn-primary { background: var(--black); color: var(--white); padding: 14px 32px; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; transition: background 0.3s, transform 0.2s; }
    .btn-primary:hover { background: #222; transform: translateY(-1px); }
    .btn-secondary { font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--black); border-bottom: 1px solid var(--black); padding-bottom: 2px; transition: opacity 0.2s; }
    .btn-secondary:hover { opacity: 0.6; }
    .hero-visual { position: relative; overflow: hidden; background: var(--beige); }
    .hero-visual-inner { width: 100%; height: 100%; background: linear-gradient(135deg, #d4c4b0 0%, #c8b8a0 40%, #b8a890 100%); display: flex; align-items: center; justify-content: center; position: relative; }
    .hero-product-visual { width: 220px; height: 320px; background: linear-gradient(160deg, #f5f0e8, #e8ddd0); border-radius: 2px; box-shadow: 24px 32px 60px rgba(0,0,0,0.2); display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; animation: float 4s ease-in-out infinite; }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
    .hero-product-label { font-family: var(--font-serif); font-size: 13px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--black); text-align: center; padding: 20px; }
    .hero-product-pct { font-size: 32px; font-weight: 300; font-family: var(--font-serif); color: var(--black); }
    .hero-badge { position: absolute; bottom: 140px; right: 48px; width: 90px; height: 90px; border-radius: 50%; background: var(--black); color: var(--white); display: flex; align-items: center; justify-content: center; text-align: center; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; line-height: 1.4; animation: spin 20s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    /* ---- TRUST BAR ---- */
    .trust-bar { display: flex; justify-content: center; gap: 64px; padding: 40px 80px; border-bottom: 1px solid var(--light-gray); flex-wrap: wrap; }
    .trust-item { display: flex; align-items: center; gap: 12px; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--gray); }
    .trust-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 18px; }

    /* ---- SECTION TITLES ---- */
    .section-header { text-align: center; margin-bottom: 64px; }
    .section-eyebrow { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gray); margin-bottom: 16px; }
    .section-title { font-family: var(--font-serif); font-size: clamp(36px, 4vw, 56px); font-weight: 300; line-height: 1.1; }
    .section-title em { font-style: italic; color: var(--amber); }

    /* ---- PRODUCTS ---- */
    .products-section { padding: 100px 80px; }
    .product-filters { display: flex; gap: 0; margin-bottom: 56px; border-bottom: 1px solid var(--light-gray); overflow-x: auto; }
    .filter-btn { padding: 12px 24px; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--gray); border-bottom: 2px solid transparent; transition: all 0.2s; white-space: nowrap; margin-bottom: -1px; }
    .filter-btn.active { color: var(--black); border-bottom-color: var(--black); }
    .filter-btn:hover { color: var(--black); }
    .products-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px 32px; }
    .product-card { cursor: pointer; }
    .product-card:hover .product-img-wrap { transform: scale(1.02); }
    .product-img-wrap { background: var(--cream); aspect-ratio: 3/4; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; transition: transform 0.4s; overflow: hidden; position: relative; }
    .product-mock { width: 80px; height: 140px; background: linear-gradient(160deg, #f0ebe3, #e0d8cc); border-radius: 2px; box-shadow: 6px 8px 24px rgba(0,0,0,0.12); display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding-bottom: 16px; position: relative; }
    .product-mock-label { font-family: var(--font-serif); font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--black); text-align: center; padding: 0 6px; }
    .product-mock-line { width: 40px; height: 1px; background: var(--beige); margin: 8px 0; }
    .product-mock-pct { font-family: var(--font-serif); font-size: 20px; font-weight: 300; color: var(--black); }
    .product-badge { position: absolute; top: 12px; left: 12px; background: var(--black); color: var(--white); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; padding: 4px 8px; }
    .product-badge.new { background: var(--amber); }
    .product-category { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gray); margin-bottom: 6px; }
    .product-name { font-family: var(--font-serif); font-size: 18px; font-weight: 400; margin-bottom: 4px; line-height: 1.3; }
    .product-desc-short { font-size: 12px; color: var(--gray); margin-bottom: 12px; line-height: 1.6; }
    .product-footer { display: flex; align-items: center; justify-content: space-between; }
    .product-price { font-size: 14px; font-weight: 500; }
    .btn-add { background: transparent; border: 1px solid var(--black); color: var(--black); padding: 7px 14px; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; transition: all 0.2s; }
    .btn-add:hover { background: var(--black); color: var(--white); }

    /* ---- DIAGNOSTIC ---- */
    .diagnostic { background: var(--black); color: var(--white); padding: 100px 80px; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
    .diagnostic-text .section-eyebrow { color: var(--amber); }
    .diagnostic-text .section-title { color: var(--white); text-align: left; margin-bottom: 24px; }
    .diagnostic-text p { color: rgba(255,255,255,0.6); line-height: 1.8; margin-bottom: 40px; }
    .diagnostic-quiz { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 40px; }
    .quiz-options { display: flex; flex-direction: column; gap: 12px; }
    .quiz-option { background: transparent; border: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.7); padding: 14px 20px; text-align: left; font-size: 13px; letter-spacing: 0.05em; transition: all 0.2s; cursor: pointer; }
    .quiz-option:hover { border-color: var(--amber); color: var(--white); background: rgba(200,168,130,0.1); }
    .quiz-option.selected { border-color: var(--amber); background: rgba(200,168,130,0.15); color: var(--white); }

    /* ---- CART SIDEBAR ---- */
    .cart-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; opacity: 0; pointer-events: none; transition: opacity 0.3s; }
    .cart-overlay.open { opacity: 1; pointer-events: all; }
    .cart-sidebar { position: absolute; top: 0; right: 0; width: 420px; height: 100%; background: var(--white); z-index: 201; transform: translateX(100%); transition: transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94); display: flex; flex-direction: column; }
    .cart-sidebar.open { transform: translateX(0); }
    .cart-header { padding: 24px 32px; border-bottom: 1px solid var(--light-gray); display: flex; justify-content: space-between; align-items: center; }
    .cart-header h3 { font-family: var(--font-serif); font-size: 22px; font-weight: 400; }
    .cart-close { font-size: 22px; color: var(--gray); transition: color 0.2s; }
    .cart-item { display: flex; gap: 16px; padding: 20px 0; border-bottom: 1px solid var(--light-gray); }
    .cart-item-img { width: 72px; height: 96px; background: var(--cream); flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
    .cart-item-info { flex: 1; }
    .cart-item-name { font-family: var(--font-serif); font-size: 16px; margin-bottom: 4px; }
    .qty-btn { width: 28px; height: 28px; border: 1px solid var(--light-gray); display: flex; align-items: center; justify-content: center; font-size: 16px; color: var(--black); transition: all 0.2s; }
    
    /* ---- MODAL ---- */
    .modal-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.6); z-index: 300; opacity: 0; pointer-events: none; transition: opacity 0.3s; display: flex; align-items: center; justify-content: center; padding: 40px; }
    .modal-overlay.open { opacity: 1; pointer-events: all; }
    .modal { background: var(--white); max-width: 800px; width: 100%; max-height: 90%; overflow-y: auto; display: grid; grid-template-columns: 1fr 1fr; transform: scale(0.96); transition: transform 0.3s; }
    .modal-overlay.open .modal { transform: scale(1); }
    .modal-img { background: var(--cream); display: flex; align-items: center; justify-content: center; min-height: 400px; }
    .modal-content { padding: 48px 40px; }
`;

export default function NaturelSkinDemo() {
    const [scrolled, setScrolled] = useState(false)
    const [cart, setCart] = useState([])
    const [cartOpen, setCartOpen] = useState(false)
    const [filter, setFilter] = useState('all')
    const [modalProduct, setModalProduct] = useState(null)
    const [quizStep, setQuizStep] = useState(1)
    const [quizAnswers, setQuizAnswers] = useState({})
    const [showQuizResult, setShowQuizResult] = useState(false)
    const containerRef = useRef(null)

    // Derived
    const cartCount = cart.reduce((s, i) => s + i.qty, 0)
    const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)

    useEffect(() => {
        const handleScroll = () => {
            if (containerRef.current) setScrolled(containerRef.current.scrollTop > 10)
        }
        const ref = containerRef.current
        if (ref) ref.addEventListener('scroll', handleScroll)

        // Fonts
        if (!document.getElementById('font-naturel')) {
            const link = document.createElement('link');
            link.id = 'font-naturel';
            link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }

        return () => ref?.removeEventListener('scroll', handleScroll)
    }, [])

    const startQuiz = () => {
        // Scroll to quiz
        document.getElementById('diagnostic').scrollIntoView({ behavior: 'smooth' })
    }

    const addToCart = (e, product) => {
        if (e) e.stopPropagation()
        setCart(prev => {
            const existing = prev.find(i => i.id === product.id)
            if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
            return [...prev, { ...product, qty: 1 }]
        })
        setCartOpen(true)
        setModalProduct(null)
    }

    const changeQty = (id, delta) => {
        setCart(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0))
    }

    // --- QUIZ LOGIC ---
    const handleQuizOption = (step, value) => {
        setQuizAnswers(prev => ({ ...prev, [step]: value }))
        if (step < 3) setQuizStep(step + 1)
        else setShowQuizResult(true)
    }

    const getQuizResult = () => {
        const concern = quizAnswers[2] || 'eclat'
        const type = quizAnswers[1] || 'mixte'
        const recs = { hydratation: [1, 3], antiage: [7, 3], eclat: [4, 2], imperfections: [2, 6] }
        return { concern, type, products: (recs[concern] || [1, 3]).map(id => PRODUCTS.find(p => p.id === id)) }
    }
    const quizResult = showQuizResult ? getQuizResult() : null

    return (
        <div className="naturel-demo">
            {/* Inject CSS */}
            <style jsx global>{CSS_STYLES}</style>

            <div ref={containerRef} className="demo-container">
                {/* TOP BANNER */}
                <div className="top-banner">Livraison offerte dès 45€ · Formules à moins de 10 ingrédients</div>

                {/* NAV */}
                <nav className={`demo-nav ${scrolled ? 'scrolled' : ''}`}>
                    <div className="nav-logo">Naturel</div>
                    <div className="nav-links">
                        <div onClick={() => setFilter('all')}>Produits</div>
                        <div>Ingrédients</div>
                        <div onClick={startQuiz}>Diagnostic</div>
                        <div>Notre mission</div>
                    </div>
                    <div className="nav-actions">
                        <button>Recherche</button>
                        <button className="cart-btn" onClick={() => setCartOpen(true)}>
                            Panier <span className="cart-count">{cartCount}</span>
                        </button>
                    </div>
                </nav>

                {/* HERO */}
                <section className="hero">
                    <div className="hero-text">
                        <p className="hero-eyebrow">Soins naturels — Made in France</p>
                        <h1 className="hero-title">La beauté<br />dans sa<br /><em>simplicité</em></h1>
                        <p className="hero-sub">Des formules courtes, des ingrédients transparents, des résultats réels. Parce que votre peau mérite le meilleur — sans le superflu.</p>
                        <div className="hero-ctas">
                            <button className="btn-primary" onClick={() => setFilter('all')}>Découvrir les soins</button>
                            <button className="btn-secondary" onClick={startQuiz}>Faire mon diagnostic</button>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="hero-visual-inner">
                            <div className="hero-product-visual">
                                <div className="hero-product-label">Sérum Acide<br />Hyaluronique</div>
                                <div className="product-mock-line"></div>
                                <div className="hero-product-pct">3%</div>
                            </div>
                            <div className="hero-badge">Vegan<br />&<br />Naturel</div>
                        </div>
                    </div>
                </section>

                {/* TRUST */}
                <div className="trust-bar">
                    <div className="trust-item"><span className="trust-icon">🌿</span>100% Vegan</div>
                    <div className="trust-item"><span className="trust-icon">🇫🇷</span>Made in France</div>
                    <div className="trust-item"><span className="trust-icon">🔬</span>Formules courtes</div>
                    <div className="trust-item"><span className="trust-icon">⭐</span>+50 000 avis</div>
                </div>

                {/* PRODUCTS */}
                <section className="products-section">
                    <div className="section-header">
                        <p className="section-eyebrow">Nos formulations</p>
                        <h2 className="section-title">Soins <em>essentiels</em></h2>
                    </div>
                    <div className="product-filters">
                        {['all', 'visage', 'corps', 'cheveux', 'serum'].map(f => (
                            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f === 'all' ? 'Tous' : f}</button>
                        ))}
                    </div>
                    <div className="products-grid">
                        {PRODUCTS.filter(p => filter === 'all' || p.tag === filter || p.category === filter).map(p => (
                            <div key={p.id} className="product-card" onClick={() => setModalProduct(p)}>
                                <div className="product-img-wrap">
                                    <div className="product-mock">
                                        <div className="product-mock-label" dangerouslySetInnerHTML={{ __html: p.name.split(' ').slice(0, 2).join('<br>') }} />
                                        <div className="product-mock-line"></div>
                                        <div className="product-mock-pct">{p.pct || '♡'}</div>
                                    </div>
                                    {p.badge && <span className={`product-badge ${p.badge}`}>{p.badge}</span>}
                                </div>
                                <div className="product-info">
                                    <div className="product-category">{p.label}</div>
                                    <div className="product-name">{p.name}</div>
                                    <div className="product-desc-short">{p.short}</div>
                                    <div className="product-footer">
                                        <span className="product-price">{p.price} €</span>
                                        <button className="btn-add" onClick={(e) => addToCart(e, p)}>+ Ajouter</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* DIAGNOSTIC */}
                <section className="diagnostic" id="diagnostic">
                    <div className="diagnostic-text">
                        <p className="section-eyebrow">Diagnostic de peau</p>
                        <h2 className="section-title" style={{ fontSize: 48 }}>Votre routine<br /><em>sur-mesure</em></h2>
                        <p>En 3 questions simples, découvrez votre type de peau et obtenez une sélection de soins parfaitement adaptés.</p>
                    </div>
                    <div className="diagnostic-quiz">
                        {!showQuizResult ? (
                            <>
                                <div style={{ width: '100%', height: 2, background: 'rgba(255,255,255,0.1)', marginBottom: 32 }}>
                                    <div style={{ width: `${quizStep * 33}%`, height: '100%', background: 'var(--amber)', transition: 'width 0.4s' }}></div>
                                </div>
                                {quizStep === 1 && (
                                    <>
                                        <div className="quiz-question" style={{ fontSize: 22, fontFamily: 'var(--font-serif)', marginBottom: 28 }}>Votre type de peau ?</div>
                                        <div className="quiz-options">
                                            {['Sèche', 'Grasse', 'Mixte', 'Sensible'].map(o => (
                                                <button key={o} className={`quiz-option ${quizAnswers[1] === o.toLowerCase() ? 'selected' : ''}`} onClick={() => handleQuizOption(1, o.toLowerCase())}>{o}</button>
                                            ))}
                                        </div>
                                    </>
                                )}
                                {quizStep === 2 && (
                                    <>
                                        <div className="quiz-question" style={{ fontSize: 22, fontFamily: 'var(--font-serif)', marginBottom: 28 }}>Votre préoccupation ?</div>
                                        <div className="quiz-options">
                                            {[{ l: 'Hydratation', v: 'hydratation' }, { l: 'Anti-âge', v: 'antiage' }, { l: 'Éclat', v: 'eclat' }, { l: 'Imperfections', v: 'imperfections' }].map(o => (
                                                <button key={o.v} className={`quiz-option ${quizAnswers[2] === o.v ? 'selected' : ''}`} onClick={() => handleQuizOption(2, o.v)}>{o.l}</button>
                                            ))}
                                        </div>
                                    </>
                                )}
                                {quizStep === 3 && (
                                    <>
                                        <div className="quiz-question" style={{ fontSize: 22, fontFamily: 'var(--font-serif)', marginBottom: 28 }}>Routine actuelle ?</div>
                                        <div className="quiz-options">
                                            {['Aucun soin', '1 à 2 soins', '3 à 5 soins'].map(o => (
                                                <button key={o} className={`quiz-option ${quizAnswers[3] === o ? 'selected' : ''}`} onClick={() => handleQuizOption(3, o)}>{o}</button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="quiz-result">
                                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, marginBottom: 16 }}>Votre routine : {quizResult.type} & {quizResult.concern}</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {quizResult.products.map(p => (
                                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 12, background: 'rgba(255,255,255,0.1)' }}>
                                            <div>{p.name}</div>
                                            <button onClick={(e) => addToCart(e, p)} style={{ textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.1em' }}>+ Ajouter</button>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => { setShowQuizResult(false); setQuizStep(1); }} style={{ marginTop: 24, textDecoration: 'underline', fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Recommencer</button>
                            </div>
                        )}
                    </div>
                </section>

                {/* TESTIMONIALS */}
                <section className="testimonials" style={{ background: 'var(--black)', color: 'white', padding: '100px 80px' }}>
                    <div className="section-header">
                        <p className="section-eyebrow" style={{ color: 'var(--amber)' }}>Avis Clients</p>
                        <h2 className="section-title">Ce qu'ils en <em>disent</em></h2>
                    </div>
                    <div style={{ display: 'flex', overflowX: 'auto', gap: 32, paddingBottom: 20 }}>
                        {TESTIMONIALS.map((t, i) => (
                            <div key={i} style={{ minWidth: 300, background: 'rgba(255,255,255,0.05)', padding: 32, border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ color: 'var(--amber)', letterSpacing: 3, marginBottom: 16 }}>★★★★★</div>
                                <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18, marginBottom: 20, lineHeight: 1.6, opacity: 0.9 }}>"{t.text}"</div>
                                <div style={{ fontSize: 11, textTransform: 'uppercase', opacity: 0.5 }}>{t.author}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FOOTER */}
                <footer>
                    <div style={{ padding: '80px', background: '#111', color: '#fff', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 40 }}>
                        <div>
                            <div className="nav-logo" style={{ color: '#fff', marginBottom: 20 }}>Naturel</div>
                            <p style={{ fontSize: 13, opacity: 0.5, lineHeight: 1.8, maxWidth: 300 }}>Soins naturels, vegan et made in France. Des formules simples pour une peau en pleine santé.</p>
                        </div>
                        <div>
                            <h4 style={{ fontSize: 11, textTransform: 'uppercase', opacity: 0.4, marginBottom: 24 }}>Soins</h4>
                            <ul style={{ listStyle: 'none', fontSize: 13, opacity: 0.7, lineHeight: 2 }}>
                                <li>Visage</li>
                                <li>Corps</li>
                                <li>Cheveux</li>
                            </ul>
                        </div>
                        <div>
                            <h4 style={{ fontSize: 11, textTransform: 'uppercase', opacity: 0.4, marginBottom: 24 }}>Aide</h4>
                            <ul style={{ listStyle: 'none', fontSize: 13, opacity: 0.7, lineHeight: 2 }}>
                                <li>FAQ</li>
                                <li>Livraison</li>
                                <li>Contact</li>
                            </ul>
                        </div>
                    </div>
                </footer>
            </div>

            {/* CART DRAWER */}
            <div className={`cart-overlay ${cartOpen ? 'open' : ''}`} onClick={() => setCartOpen(false)} />
            <div className={`cart-sidebar ${cartOpen ? 'open' : ''}`}>
                <div className="cart-header">
                    <h3>Mon panier</h3>
                    <button className="cart-close" onClick={() => setCartOpen(false)}>×</button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
                    {cart.map(item => (
                        <div key={item.id} className="cart-item">
                            <div className="cart-item-img"><div style={{ width: 30, height: 50, background: '#e8ddd0' }}></div></div>
                            <div className="cart-item-info">
                                <div className="cart-item-name">{item.name}</div>
                                <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
                                    <button className="qty-btn" onClick={() => changeQty(item.id, -1)}>−</button>
                                    <span style={{ width: 30, textAlign: 'center' }}>{item.qty}</span>
                                    <button className="qty-btn" onClick={() => changeQty(item.id, 1)}>+</button>
                                </div>
                            </div>
                            <div className="cart-item-price">{(item.price * item.qty).toFixed(2)} €</div>
                        </div>
                    ))}
                    {cart.length === 0 && <div style={{ textAlign: 'center', marginTop: 60, opacity: 0.5 }}>Votre panier est vide</div>}
                </div>
                <div style={{ padding: '24px 32px', borderTop: '1px solid #eee' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, fontWeight: 500 }}>
                        <span>Total</span>
                        <span>{cartTotal.toFixed(2)} €</span>
                    </div>
                    <button style={{ width: '100%', background: 'var(--black)', color: 'white', padding: 16, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Commander</button>
                </div>
            </div>

            {/* PRODUCT MODAL */}
            <div className={`modal-overlay ${modalProduct ? 'open' : ''}`} onClick={() => setModalProduct(null)}>
                {modalProduct && (
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-img">
                            <div className="product-mock" style={{ width: 100, height: 180, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                                <div className="product-mock-label">{modalProduct.name}</div>
                                <div className="product-mock-line"></div>
                                <div className="product-mock-pct">{modalProduct.pct}</div>
                            </div>
                        </div>
                        <div className="modal-content">
                            <button className="modal-close" onClick={() => setModalProduct(null)} style={{ float: 'right' }}>×</button>
                            <div className="modal-category">{modalProduct.label}</div>
                            <div className="modal-name">{modalProduct.name}</div>
                            <div className="modal-tagline" style={{ marginBottom: 24, color: '#666' }}>{modalProduct.short}</div>
                            <div className="modal-price" style={{ fontSize: 24, fontWeight: 500, marginBottom: 32 }}>{modalProduct.price} €</div>
                            <div style={{ marginBottom: 32 }}>
                                <h4 style={{ fontSize: 11, textTransform: 'uppercase', color: '#999', marginBottom: 12 }}>Ingrédients</h4>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {modalProduct.ingredients.map(i => <span key={i} style={{ border: '1px solid #eee', padding: '4px 12px', fontSize: 11 }}>{i}</span>)}
                                </div>
                            </div>
                            <button className="btn-primary" style={{ width: '100%' }} onClick={(e) => addToCart(e, modalProduct)}>Ajouter au panier</button>
                        </div>
                    </div>
                )}
            </div>

            {/* CHATBOT INTEGRATION */}
            <div style={{ position: 'absolute', bottom: 30, right: 30, zIndex: 900 }}>
                <DemoChatStore context={{
                    storeType: "Naturel (Site de Test)",
                    cartCount: cartCount,
                    cartTotal: cartTotal,
                    page: "home",
                    cartOpen: cartOpen,
                    knowledgeBase: NATUREL_DATA
                }} />
            </div>
        </div>
    )
}
