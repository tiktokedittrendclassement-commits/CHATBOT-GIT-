'use client'

import { useState, useMemo } from 'react'
import { ShoppingBag, Star, X, Menu, Search, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DemoChatStore from '@/components/demo-chat-store'

const PRODUCTS = [
    {
        id: 1,
        name: "Noir Overcoat v.2",
        price: 890,
        category: "Outerwear",
        description: "Coupe minimaliste architecturale. Laine vierge et doublure en soie. Fabriqué à la main.",
        image: "https://images.unsplash.com/photo-1539533377285-aed3cc882329?w=800&q=80",
        rating: 5,
        stock: true,
        specs: ["100% Laine Vierge", "Doublure Soie Italienne", "Boutons Corne Naturelle"]
    },
    {
        id: 2,
        name: "Linear Boots 04",
        price: 450,
        category: "Footwear",
        description: "Cuir poli haute brillance. Semelle technologique pour un confort urbain absolu.",
        image: "https://images.unsplash.com/photo-1520639889313-7278275b1da0?w=800&q=80",
        rating: 5,
        stock: true,
        specs: ["Cuir de Veau LWG", "Semelle EVA/Gomme", "Résistant à l'eau"]
    },
    {
        id: 3,
        name: "Monolith Tote",
        price: 280,
        category: "Accessories",
        description: "Structure rigide et volume généreux. Toile technique enduite ultra-résistante.",
        image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80",
        rating: 4,
        stock: true,
        specs: ["Toile Cordura 1000D", "Détails Cuir", "Volume 24L"]
    },
    {
        id: 4,
        name: "Prism Knit",
        price: 320,
        category: "Knitwear",
        description: "Maille complexe en relief. Mérinos extra-fin pour une douceur exceptionnelle.",
        image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80",
        rating: 5,
        stock: true,
        specs: ["100% Mérinos Extra-fin", "Maille 3D", "Col Montant"]
    }
]

export default function DemoStore() {
    const [view, setView] = useState('home') // home, shop, product, cart, checkout, faq, privacy
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [cart, setCart] = useState([])
    const [checkoutStatus, setCheckoutStatus] = useState('idle')

    const cartTotal = cart.reduce((acc, item) => acc + item.price, 0)

    const chatContext = useMemo(() => ({
        product: selectedProduct,
        cart,
        view,
        total: cartTotal
    }), [selectedProduct?.id, cart.length, view, cartTotal]);

    // Close view helper
    const navigate = (v) => {
        setView(v);
        if (v !== 'product') setSelectedProduct(null);
        // Scroll top in the internal container
        const container = document.getElementById('demo-content-area');
        if (container) container.scrollTop = 0;

    }

    const addToCart = (product) => {
        setCart(prev => [...prev, { ...product, cartId: Math.random() }])
        // No alert, just move to cart for immersion
        setView('cart')
    }

    const removeFromCart = (cartId) => {
        setCart(prev => prev.filter(item => item.cartId !== cartId))
    }



    const renderNavbar = () => (
        <header style={{ padding: '20px 32px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
                <div
                    onClick={() => navigate('home')}
                    style={{ fontWeight: 900, fontSize: 22, letterSpacing: '-2px', color: '#000', cursor: 'pointer' }}>
                    AESTHETIX
                </div>
                <nav style={{ display: 'flex', gap: 24, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <span onClick={() => navigate('shop')} style={{ cursor: 'pointer', opacity: view === 'shop' ? 1 : 0.5 }}>Collection</span>
                    <span onClick={() => navigate('faq')} style={{ cursor: 'pointer', opacity: view === 'faq' ? 1 : 0.5 }}>Aide</span>
                </nav>
            </div>

            <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                <div onClick={() => navigate('cart')} style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShoppingBag size={18} color="#000" />
                    <span style={{ fontSize: 12, fontWeight: 800 }}>{cart.length}</span>
                </div>
            </div>
        </header>
    )

    const renderFooter = () => (
        <footer style={{ background: '#000', color: '#fff', padding: '48px 32px', marginTop: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 40, marginBottom: 40 }}>
                <div>
                    <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: '-1.5px', marginBottom: 16 }}>AESTHETIX</div>
                    <p style={{ fontSize: 12, opacity: 0.6, lineHeight: 1.6, maxWidth: 240 }}>
                        L'archive de la mode contemporaine. Design, fonction et durabilité.
                    </p>
                </div>
                <div>
                    <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 16 }}>Support</div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <li onClick={() => navigate('faq')} style={{ opacity: 0.6, cursor: 'pointer' }}>FAQ</li>
                        <li style={{ opacity: 0.6, cursor: 'pointer' }}>Expédition</li>
                        <li style={{ opacity: 0.6, cursor: 'pointer' }}>Retours</li>
                    </ul>
                </div>
                <div>
                    <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 16 }}>Légal</div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <li onClick={() => navigate('privacy')} style={{ opacity: 0.6, cursor: 'pointer' }}>Confidentialité</li>
                        <li style={{ opacity: 0.6, cursor: 'pointer' }}>CGV</li>
                    </ul>
                </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24, fontSize: 10, opacity: 0.4, textTransform: 'uppercase', letterSpacing: '1px' }}>
                © 2026 AESTHETIX ARCHIVE. TOUS DROITS RÉSERVÉS.
            </div>
        </footer>
    )

    const renderHome = () => (
        <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
            <div style={{ height: 400, background: '#000', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', padding: '0 64px' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', background: 'url(https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.6 }}></div>
                <div style={{ position: 'relative', zIndex: 2, maxWidth: 500 }}>
                    <div style={{ color: '#fff', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: 20 }}>Winter Collection 2026.vv</div>
                    <h2 style={{ color: '#fff', fontSize: 56, fontWeight: 900, lineHeight: 0.9, marginBottom: 32, letterSpacing: '-3px' }}>FORME & FONCTION.</h2>
                    <Button onClick={() => navigate('shop')} style={{ background: '#fff', color: '#000', height: 50, padding: '0 32px', borderRadius: 0, fontWeight: 900 }}>DÉCOUVRIR L'ARCHIVE</Button>
                </div>
            </div>
            <div style={{ padding: '64px 32px' }}>
                <div style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 40, borderBottom: '2px solid #000', display: 'inline-block', paddingBottom: 8 }}>Sélection Curatée</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                    {PRODUCTS.slice(0, 4).map(p => (
                        <div key={p.id} onClick={() => {
                            setSelectedProduct(p);
                            navigate('product');
                            // Direct trigger because navigate might use old selectedProduct if not careful
                            window.dispatchEvent(new CustomEvent('vendo-proactive-trigger', {
                                detail: { message: `Ce ${p.name} est magnifique ! Vous voulez des détails ? ✨` }
                            }))
                        }} style={{ cursor: 'pointer' }}>
                            <div style={{ aspectRatio: '3/4', background: '#f5f5f5', overflow: 'hidden', marginBottom: 12 }}>
                                <img src={p.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ fontWeight: 800, fontSize: 14 }}>{p.name}</div>
                            <div style={{ fontSize: 13, color: '#666' }}>{p.price.toFixed(2)} €</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )

    const renderShop = () => (
        <div style={{ padding: 40, animation: 'fadeIn 0.4s ease-out' }}>
            <div style={{ fontSize: 32, fontWeight: 900, marginBottom: 40, letterSpacing: '-1px' }}>Toute la Collection.</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
                {PRODUCTS.map(p => (
                    <div key={p.id} onClick={() => {
                        setSelectedProduct(p);
                        navigate('product');
                        window.dispatchEvent(new CustomEvent('vendo-proactive-trigger', {
                            detail: { message: `Vous avez bon goût ! Le ${p.name} est une pièce d'exception. 🧥` }
                        }))
                    }} style={{ cursor: 'pointer' }}>
                        <div style={{ aspectRatio: '3/4', background: '#f5f5f5', overflow: 'hidden', marginBottom: 16 }}>
                            <img src={p.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>{p.category}</div>
                        <div style={{ fontWeight: 800, fontSize: 15 }}>{p.name}</div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{p.price.toFixed(2)} €</div>
                    </div>
                ))}
            </div>
        </div>
    )

    const renderProduct = () => {
        if (!selectedProduct) return null;
        return (
            <div style={{ padding: 64, animation: 'fadeIn 0.4s ease-out' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 64 }}>
                    <div style={{ background: '#f5f5f5', aspectRatio: '3/4' }}>
                        <img src={selectedProduct.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>{selectedProduct.category}</div>
                        <h1 style={{ fontSize: 48, fontWeight: 900, letterSpacing: '-2px', lineHeight: 1, marginBottom: 24 }}>{selectedProduct.name}</h1>
                        <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 32 }}>{selectedProduct.price.toFixed(2)} €</div>
                        <p style={{ fontSize: 16, lineHeight: 1.6, color: '#444', marginBottom: 40 }}>{selectedProduct.description}</p>

                        <div style={{ marginBottom: 40 }}>
                            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 16 }}>Spécifications</div>
                            {selectedProduct.specs.map((s, i) => (
                                <div key={i} style={{ fontSize: 14, borderBottom: '1px solid #eee', padding: '12px 0' }}>{s}</div>
                            ))}
                        </div>

                        <Button
                            onClick={() => addToCart(selectedProduct)}
                            style={{ background: '#000', color: '#fff', width: '100%', height: 60, borderRadius: 0, fontWeight: 900, fontSize: 16 }}>
                            AJOUTER AU PANIER
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    const renderCart = () => (
        <div style={{ padding: 64, animation: 'fadeIn 0.4s ease-out' }}>
            <h2 style={{ fontSize: 40, fontWeight: 900, marginBottom: 48, letterSpacing: '-1px' }}>Votre Panier ({cart.length})</h2>
            {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <p style={{ fontSize: 18, color: '#666', marginBottom: 32 }}>Votre panier est vide.</p>
                    <Button onClick={() => navigate('shop')} style={{ background: '#000', color: '#fff', borderRadius: 0 }}>CONTINUER LE SHOPPING</Button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 64 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        {cart.map(item => (
                            <div key={item.cartId} style={{ display: 'grid', gridTemplateColumns: '100px 1fr auto', gap: 24, borderBottom: '1px solid #eee', paddingBottom: 24 }}>
                                <img src={item.image} style={{ width: '100%', height: 130, objectFit: 'cover' }} />
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: 18 }}>{item.name}</div>
                                    <div style={{ fontSize: 14, color: '#666' }}>{item.category}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>{item.price.toFixed(2)} €</div>
                                    <button onClick={() => removeFromCart(item.cartId)} style={{ background: 'none', border: 'none', color: '#666', textDecoration: 'underline', fontSize: 12, cursor: 'pointer' }}>Supprimer</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ padding: 32, background: '#f5f5f5' }}>
                        <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 24 }}>Récapitulatif</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                            <span>Sous-total</span>
                            <span>{cartTotal.toFixed(2)} €</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                            <span>Livraison</span>
                            <span>Gratuit</span>
                        </div>
                        <div style={{ borderTop: '2px solid #000', marginTop: 24, paddingTop: 24, display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: 24 }}>
                            <span>Total</span>
                            <span>{cartTotal.toFixed(2)} €</span>
                        </div>
                        <Button onClick={() => setView('checkout')} style={{ background: '#000', color: '#fff', width: '100%', height: 60, borderRadius: 0, marginTop: 32, fontWeight: 900 }}>COMMANDER</Button>
                    </div>
                </div>
            )}
        </div>
    )

    const renderCheckout = () => (
        <div style={{ padding: 64, animation: 'fadeIn 0.4s ease-out' }}>
            <h2 style={{ fontSize: 40, fontWeight: 900, marginBottom: 48, letterSpacing: '-1px' }}>Checkout.</h2>
            {checkoutStatus === 'success' ? (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', border: '4px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
                        <Check size={40} />
                    </div>
                    <h3 style={{ fontSize: 32, fontWeight: 900 }}>Merci pour votre achat.</h3>
                    <p style={{ color: '#666', marginTop: 16 }}>Commande #AEX-2026-9901 confirmée.</p>
                    <Button onClick={() => { navigate('home'); setCart([]); setCheckoutStatus('idle'); }} style={{ background: '#000', color: '#fff', marginTop: 40, borderRadius: 0 }}>RETOUR À L'ACCUEIL</Button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 64 }}>
                    <div>
                        <div style={{ marginBottom: 40 }}>
                            <div style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', marginBottom: 24 }}>1. Livraison</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <input placeholder="Prénom" style={{ padding: 16, border: '1px solid #000' }} />
                                <input placeholder="Nom" style={{ padding: 16, border: '1px solid #000' }} />
                                <input placeholder="Email" style={{ padding: 16, border: '1px solid #000', gridColumn: 'span 2' }} />
                                <input placeholder="Adresse" style={{ padding: 16, border: '1px solid #000', gridColumn: 'span 2' }} />
                                <input placeholder="Ville" style={{ padding: 16, border: '1px solid #000' }} />
                                <input placeholder="Code Postal" style={{ padding: 16, border: '1px solid #000' }} />
                            </div>
                        </div>
                        <Button
                            onClick={() => { setCheckoutStatus('success'); }}
                            style={{ background: '#000', color: '#fff', height: 60, padding: '0 48px', borderRadius: 0, fontWeight: 900 }}>PAYER {cartTotal.toFixed(2)} €</Button>
                    </div>
                    <div style={{ opacity: 0.5 }}>
                        <div style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', marginBottom: 24 }}>Articles</div>
                        {cart.map(item => (
                            <div key={item.cartId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                                <span>{item.name}</span>
                                <span>{item.price.toFixed(2)} €</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )

    const renderFAQ = () => (
        <div style={{ padding: 64, animation: 'fadeIn 0.4s ease-out' }}>
            <h2 style={{ fontSize: 40, fontWeight: 900, marginBottom: 48, letterSpacing: '-1px' }}>Aide & FAQ.</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 600 }}>
                <div>
                    <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>Quels sont les délais de livraison ?</div>
                    <p style={{ color: '#666', lineHeight: 1.6 }}>Nous expédions vos commandes sous 24h. La livraison prend généralement 3 à 5 jours ouvrés.</p>
                </div>
                <div>
                    <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>Puis-je retourner un article ?</div>
                    <p style={{ color: '#666', lineHeight: 1.6 }}>Oui, vous avez 30 jours pour retourner tout article non porté dans son emballage d'origine.</p>
                </div>
            </div>
        </div>
    )

    const renderPrivacy = () => (
        <div style={{ padding: 64, animation: 'fadeIn 0.4s ease-out' }}>
            <h2 style={{ fontSize: 40, fontWeight: 900, marginBottom: 48, letterSpacing: '-1px' }}>Confidentialité.</h2>
            <div style={{ color: '#666', lineHeight: 2, maxWidth: 600 }}>
                Vos données sont traitées avec le plus grand soin. Nous utilisons vos informations uniquement pour le traitement de vos commandes et l'amélioration de votre expérience sur AESTHETIX.
            </div>
        </div>
    )

    return (
        <div style={{
            background: 'white',
            borderRadius: 0,
            boxShadow: '0 50px 100px -20px rgba(0,0,0,0.3)',
            border: '2px solid #000',
            overflow: 'hidden',
            position: 'relative',
            height: 750,
            display: 'flex',
            flexDirection: 'column',
            fontFamily: "'Inter', sans-serif",
            color: '#000'
        }}>
            {renderNavbar()}

            <div id="demo-content-area" style={{ overflowY: 'auto', flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1 }}>
                    {view === 'home' && renderHome()}
                    {view === 'shop' && renderShop()}
                    {view === 'product' && renderProduct()}
                    {view === 'cart' && renderCart()}
                    {view === 'checkout' && renderCheckout()}
                    {view === 'faq' && renderFAQ()}
                    {view === 'privacy' && renderPrivacy()}
                </div>
                {renderFooter()}
            </div>

            {/* Stable Chat Widget */}
            <div style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 100 }}>
                <DemoChatStore context={chatContext} />
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}
