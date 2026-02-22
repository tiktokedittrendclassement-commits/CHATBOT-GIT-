'use client'

import { useState, useEffect, useRef } from 'react'
import { Maximize, Minimize, ShoppingBag, Star, Zap, Info, ShieldCheck, Truck } from 'lucide-react'
import DemoChatStore from '@/components/demo-chat-store'
import { VESTO_DATA } from '@/data/vesto-data'

// --- ASSETS & DATA FOR VESTO (Thomas's Client Type) ---
const PRODUCTS = [
    { id: 1, name: 'Hoodie Performance', short: 'Coupe athlétique, tissu respirant', category: 'hauts', label: 'Apparel', price: 65, badge: 'best-seller', tag: 'hauts', details: 'Le hoodie parfait pour l\'échauffement ou le quotidien.', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80' },
    { id: 2, name: 'Jogger Tech-Fit', short: 'Stretch 4 sens, chevilles resserrées', category: 'bas', label: 'Apparel', price: 55, badge: 'nouveauté', tag: 'bas', details: 'Optimisé pour la mobilité et le confort.', image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80' },
    { id: 3, name: 'T-shirt Compression', short: 'Maintien musculaire optimal', category: 'hauts', label: 'Pro', price: 35, badge: null, tag: 'hauts', details: 'Améliore la circulation pendant l\'effort.', image: 'https://images.unsplash.com/photo-1581009146145-b5ef03a7403f?w=800&q=80' },
    { id: 4, name: 'Short 2-en-1', short: 'Doublure compression intégrée', category: 'bas', label: 'Essential', price: 45, badge: null, tag: 'bas', details: 'Le short ultime pour le leg day.', image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80' },
    { id: 5, name: 'Veste Coupe-vent', short: 'Ultra-légère, déperlante', category: 'vestes', label: 'Outdoor', price: 89, badge: null, tag: 'vestes', details: 'Protège contre les éléments sans encombre.', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80' },
    { id: 6, name: 'Brassière High-Impact', short: 'Maintien maximal, dos croisé', category: 'femme', label: 'Pro', price: 40, badge: 'best-seller', tag: 'femme', details: 'Conçue pour les entraînements intensifs.', image: 'https://images.unsplash.com/photo-1548330065-2956a6245c48?w=800&q=80' },
]

const TESTIMONIALS = [
    { text: "La qualité du tissu est incroyable. J'ai fait 10 lavages et le hoodie bouge pas.", author: "Nicolas P., Coach", stars: 5 },
    { text: "Enfin des joggers qui tombent bien au niveau des chevilles. Je repasse commande direct.", author: "Bastien L., CrossFit", stars: 5 },
    { text: "Le service client est top (merci au bot !), j'ai eu ma réponse sur la taille en 2 secondes.", author: "Julie V., Fitness", stars: 5 },
]

const CSS_STYLES = `
    /* ---- RESET & BASE ---- */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --primary: #673DE6;
      --black: #050505;
      --bg: #0a0a0a;
      --card-bg: #151515;
      --text: #ffffff;
      --muted: #888888;
      --border: rgba(255,255,255,0.08);
      --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
    }
    .naturel-demo {
        position: relative;
        height: 100%;
        overflow: hidden;
        background: var(--bg);
        color: var(--text);
        font-family: var(--font-sans);
    }
    .demo-container { 
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-width: thin;
        scrollbar-color: var(--primary) transparent;
    }
    
    .fullscreen-btn {
        background: rgba(255,255,255,0.05);
        color: #fff;
        border: 1px solid var(--border);
        border-radius: 8px;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
    }
    .fullscreen-btn:hover {
        background: rgba(255,255,255,0.1);
        border-color: var(--primary);
    }

    .demo-container a { text-decoration: none; color: inherit; }
    .demo-container img { display: block; max-width: 100%; }
    .demo-container button { cursor: pointer; border: none; background: none; font-family: var(--font-sans); }
    
    /* ---- TOP BANNER ---- */
    .top-banner { 
        background: linear-gradient(to right, #673DE6, #8B5CF6);
        color: #fff;
        text-align: center;
        padding: 8px 20px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
    }

    /* ---- NAV ---- */
    .demo-nav { 
        position: sticky;
        top: 0;
        z-index: 100;
        background: rgba(10, 10, 10, 0.8);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 40px;
        height: 72px;
    }
    .nav-logo { font-size: 24px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; }
    .nav-logo em { color: var(--primary); font-style: normal; }
    .nav-links { display: flex; gap: 24px; }
    .nav-links div { font-size: 13px; font-weight: 500; color: var(--muted); cursor: pointer; transition: color 0.2s; }
    .nav-links div:hover { color: #fff; }
    .nav-actions { display: flex; gap: 16px; align-items: center; }
    .cart-btn { 
        background: var(--text) !important;
        color: var(--black) !important;
        padding: 8px 16px;
        border-radius: 8px;
        font-weight: 700;
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .cart-count { background: var(--primary); color: #fff; border-radius: 4px; padding: 2px 6px; font-size: 11px; }

    /* ---- HERO ---- */
    .hero { 
        padding: 80px 40px;
        text-align: center;
        background: radial-gradient(circle at top, rgba(103, 61, 230, 0.1) 0%, transparent 70%);
    }
    .hero-eyebrow { font-size: 12px; font-weight: 800; color: var(--primary); text-transform: uppercase; margin-bottom: 16px; letter-spacing: 2px; }
    .hero-title { font-size: 64px; font-weight: 900; letter-spacing: -2px; line-height: 1; margin-bottom: 24px; }
    .hero-sub { font-size: 18px; color: var(--muted); max-width: 600px; margin: 0 auto 40px; }
    .btn-primary { 
        background: var(--primary);
        color: #fff;
        padding: 16px 32px;
        border-radius: 12px;
        font-weight: 700;
        font-size: 15px;
        transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(103, 61, 230, 0.3); }

    /* ---- PRODUCTS ---- */
    .products-section { padding: 80px 40px; }
    .products-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .product-card { 
        background: var(--card-bg);
        border: 1px solid var(--border);
        border-radius: 20px;
        overflow: hidden;
        transition: border-color 0.2s;
        cursor: pointer;
    }
    .product-card:hover { border-color: var(--primary); }
    .product-img-wrap { aspect-ratio: 1; overflow: hidden; position: relative; }
    .product-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
    .product-card:hover .product-img { transform: scale(1.05); }
    .product-badge { position: absolute; top: 12px; left: 12px; background: var(--primary); color: #fff; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; }
    .product-info { padding: 20px; }
    .product-name { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
    .product-price { font-size: 16px; color: var(--muted); }
    .btn-add { 
        margin-top: 16px;
        width: 100%;
        border: 1px solid var(--border);
        padding: 12px;
        border-radius: 10px;
        font-weight: 600;
        font-size: 14px;
        transition: all 0.2s;
    }
    .btn-add:hover { background: #fff; color: #000; }

    /* ---- TRUST ---- */
    .trust-bar { display: flex; justify-content: center; gap: 40px; padding: 40px; border-top: 1px solid var(--border); }
    .trust-item { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--muted); }

    /* ---- CART SIDEBAR ---- */
    .cart-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.8); z-index: 200; opacity: 0; pointer-events: none; transition: opacity 0.3s; }
    .cart-overlay.open { opacity: 1; pointer-events: all; }
    .cart-sidebar { position: absolute; top: 0; right: 0; width: 400px; height: 100%; background: #0a0a0a; border-left: 1px solid var(--border); z-index: 201; transform: translateX(100%); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; }
    .cart-sidebar.open { transform: translateX(0); }
    .cart-header { padding: 24px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
    .cart-close { color: var(--muted); font-size: 24px; }
`;

export default function VestoDemo() {
    const [scrolled, setScrolled] = useState(false)
    const [cart, setCart] = useState([])
    const [cartOpen, setCartOpen] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const containerRef = useRef(null)

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => console.error(err));
        } else {
            document.exitFullscreen();
        }
    }

    useEffect(() => {
        const handleFSChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFSChange);
        return () => document.removeEventListener('fullscreenchange', handleFSChange);
    }, [])

    const cartCount = cart.reduce((s, i) => s + i.qty, 0)
    const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)

    const addToCart = (e, product) => {
        if (e) e.stopPropagation()
        setCart(prev => {
            const existing = prev.find(i => i.id === product.id)
            if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
            return [...prev, { ...product, qty: 1 }]
        })
        setCartOpen(true)
    }

    const changeQty = (id, delta) => {
        setCart(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0))
    }

    return (
        <div className="naturel-demo" ref={containerRef}>
            <style jsx global>{CSS_STYLES}</style>

            <div className="demo-container">
                <div className="top-banner">Livraison express offerte · Retours gratuits sous 30 jours</div>

                <nav className="demo-nav">
                    <div className="nav-logo">VESTO<em>.</em></div>
                    <div className="nav-links">
                        <div>Shop All</div>
                        <div>Nouveautés</div>
                        <div>Best-sellers</div>
                        <div>Concept</div>
                    </div>
                    <div className="nav-actions">
                        <button onClick={toggleFullscreen} className="fullscreen-btn">
                            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                        </button>
                        <button className="cart-btn" onClick={() => setCartOpen(true)}>
                            <ShoppingBag size={18} /> Panier <span className="cart-count">{cartCount}</span>
                        </button>
                    </div>
                </nav>

                <section className="hero">
                    <p className="hero-eyebrow">Activewear de précision</p>
                    <h1 className="hero-title">Dépassez vos<br />limites.</h1>
                    <p className="hero-sub">Des textiles techniques conçus pour la performance extrême et le confort quotidien. Pour ceux qui ne s'arrêtent jamais.</p>
                    <button className="btn-primary">Découvrir la collection</button>
                </section>

                <div className="trust-bar">
                    <div className="trust-item"><Truck size={16} /> Livraison 24-48h</div>
                    <div className="trust-item"><ShieldCheck size={16} /> Garantie 2 ans</div>
                    <div className="trust-item"><Star size={16} /> 4.9/5 sur 12k avis</div>
                </div>

                <section className="products-section">
                    <div className="products-grid">
                        {PRODUCTS.map(p => (
                            <div key={p.id} className="product-card">
                                <div className="product-img-wrap">
                                    <img src={p.image} alt={p.name} className="product-img" />
                                    {p.badge && <span className="product-badge">{p.badge}</span>}
                                </div>
                                <div className="product-info">
                                    <div className="product-name">{p.name}</div>
                                    <div className="product-price">{p.price} €</div>
                                    <button className="btn-add" onClick={(e) => addToCart(e, p)}>Ajouter au panier</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <footer style={{ padding: '40px', background: '#050505', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                    <div className="nav-logo" style={{ marginBottom: 20 }}>VESTO<em>.</em></div>
                    <p style={{ color: 'var(--muted)', fontSize: 13 }}>© 2026 VESTO Performance. Tous droits réservés.</p>
                </footer>
            </div>

            {/* CART DRAWER */}
            <div className={`cart-overlay ${cartOpen ? 'open' : ''}`} onClick={() => setCartOpen(false)} />
            <div className={`cart-sidebar ${cartOpen ? 'open' : ''}`}>
                <div className="cart-header">
                    <h3 style={{ fontWeight: 800 }}>VOTRE PANIER</h3>
                    <button className="cart-close" onClick={() => setCartOpen(false)}>×</button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                    {cart.map(item => (
                        <div key={item.id} style={{ display: 'flex', gap: 16, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 20 }}>
                            <img src={item.image} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 12 }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: 15 }}>{item.name}</div>
                                <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>{item.price} €</div>
                                <div style={{ display: 'flex', alignItems: 'center', marginTop: 12, gap: 12 }}>
                                    <button onClick={() => changeQty(item.id, -1)} style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid var(--border)', color: '#fff' }}>-</button>
                                    <span>{item.qty}</span>
                                    <button onClick={() => changeQty(item.id, 1)} style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid var(--border)', color: '#fff' }}>+</button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {cart.length === 0 && <div style={{ textAlign: 'center', marginTop: 100, color: 'var(--muted)' }}>Votre panier est vide</div>}
                </div>
                {cart.length > 0 && (
                    <div style={{ padding: '24px', background: '#0a0a0a', borderTop: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, fontWeight: 700, fontSize: 18 }}>
                            <span>Total</span>
                            <span>{cartTotal} €</span>
                        </div>
                        <button style={{ width: '100%', background: 'var(--primary)', color: 'white', padding: 18, borderRadius: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Procéder au paiement</button>
                    </div>
                )}
            </div>

            {/* CHATBOT INTEGRATION */}
            <DemoChatStore context={{
                storeType: "VESTO (Activewear)",
                cartCount: cartCount,
                cartTotal: cartTotal,
                page: "home",
                cartOpen: cartOpen,
                knowledgeBase: VESTO_DATA
            }} />
        </div>
    )
}
