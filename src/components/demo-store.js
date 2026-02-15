'use client'

import { useState } from 'react'
import { ShoppingBag, Star, X, Menu, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DemoChatStore from '@/components/demo-chat-store'

const PRODUCTS = [
    {
        id: 1,
        name: "Sneakers Urban Pulse",
        price: "129.90 €",
        category: "Chaussures",
        description: "Design futuriste et confort absolu. Semelle à mémoire de forme.",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",
        rating: 5,
        stock: true
    },
    {
        id: 2,
        name: "Montre Chrono Gold",
        price: "249.00 €",
        category: "Accessoires",
        description: "Élégance intemporelle. Résistante à l'eau 50m. Verre saphir.",
        image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&q=80",
        rating: 4,
        stock: true
    },
    {
        id: 3,
        name: "Sac Voyage Cuir",
        price: "189.00 €",
        category: "Maroquinerie",
        description: "Cuir véritable pleine fleur. Compartiment ordinateur 15 pouces.",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80",
        rating: 5,
        stock: false
    }
]

export default function DemoStore() {
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [cartCount, setCartCount] = useState(0)

    const addToCart = () => {
        setCartCount(prev => prev + 1)
        alert("Produit ajouté au panier (Simulation) !")
    }

    return (
        <div style={{
            background: 'white',
            borderRadius: 32,
            boxShadow: '0 40px 100px -20px rgba(0,0,0,0.15)',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            position: 'relative',
            height: 700,
            display: 'flex',
            flexDirection: 'column',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Top Bar Branding */}
            <header style={{ padding: '24px 32px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Menu size={20} color="#64748B" style={{ cursor: 'pointer' }} />
                    <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: '-1px', color: '#0F172A' }}>
                        LUMINA<span style={{ color: '#6366F1' }}>.</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                    <Search size={20} color="#64748B" style={{ cursor: 'pointer' }} />
                    <div style={{ position: 'relative', cursor: 'pointer' }}>
                        <ShoppingBag size={20} color="#0F172A" />
                        {cartCount > 0 && (
                            <span style={{ position: 'absolute', top: -6, right: -6, background: '#6366F1', color: 'white', fontSize: 10, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{cartCount}</span>
                        )}
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <div style={{ overflowY: 'auto', background: '#f8fafc', flex: 1, position: 'relative' }}>

                {/* Hero Banner (Only visible on home) */}
                {!selectedProduct && (
                    <div style={{ height: 200, background: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexDirection: 'column', textAlign: 'center' }}>
                        <h2 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 8, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>Collection Été 2026</h2>
                        <p style={{ opacity: 0.9, fontSize: 14 }}>L'élégance au quotidien.</p>
                    </div>
                )}

                <div style={{ padding: 24 }}>
                    {selectedProduct ? (
                        // Product Details View
                        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
                            <button
                                onClick={() => setSelectedProduct(null)}
                                style={{ marginBottom: 20, fontSize: 14, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}
                            >
                                ← Retour au catalogue
                            </button>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30 }}>
                                <div style={{ background: 'white', padding: 10, borderRadius: 12, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                    <img src={selectedProduct.image} alt={selectedProduct.name} style={{ width: '100%', borderRadius: 8, objectFit: 'cover', aspectRatio: '1/1' }} />
                                </div>

                                <div>
                                    <div style={{ fontSize: 12, color: '#6366F1', fontWeight: 800, textTransform: 'uppercase', marginBottom: 12, letterSpacing: '1px' }}>{selectedProduct.category}</div>
                                    <h3 style={{ fontSize: 32, fontWeight: 900, marginBottom: 16, color: '#0F172A', letterSpacing: '-1px' }}>{selectedProduct.name}</h3>
                                    <div style={{ fontSize: 28, color: '#0F172A', fontWeight: 900, marginBottom: 20 }}>{selectedProduct.price}</div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={16} fill={i < selectedProduct.rating ? "#FBBF24" : "#E2E8F0"} color={i < selectedProduct.rating ? "#FBBF24" : "#E2E8F0"} />
                                        ))}
                                        <span style={{ fontSize: 14, color: '#64748B', marginLeft: 8, fontWeight: 500 }}>(124 avis)</span>
                                    </div>

                                    <p style={{ color: '#475569', marginBottom: 32, lineHeight: 1.6, fontSize: 15, fontWeight: 500 }}>
                                        {selectedProduct.description}
                                    </p>

                                    <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
                                        <div style={{ padding: '10px 18px', border: '1px solid #E2E8F0', borderRadius: 12, cursor: 'pointer', background: 'white', fontWeight: 600 }}>S</div>
                                        <div style={{ padding: '10px 18px', border: '1px solid #6366F1', borderRadius: 12, cursor: 'pointer', background: '#EEF2FF', color: '#6366F1', fontWeight: 700 }}>M</div>
                                        <div style={{ padding: '10px 18px', border: '1px solid #E2E8F0', borderRadius: 12, cursor: 'pointer', background: 'white', fontWeight: 600 }}>L</div>
                                    </div>

                                    <Button size="lg" className="w-full" onClick={addToCart} disabled={!selectedProduct.stock} style={{ background: selectedProduct.stock ? '#6366F1' : '#94A3B8', height: 54, borderRadius: 16, fontWeight: 800 }}>
                                        {selectedProduct.stock ? 'Ajouter au panier' : 'Rupture de stock'}
                                    </Button>

                                    <div style={{ marginTop: 16, fontSize: 12, color: '#64748b', display: 'flex', gap: 16, justifyContent: 'center' }}>
                                        <span>🚚 Livraison Gratuite</span>
                                        <span>↩️ Retours 30 jours</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Grid View
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}>Nouveautés</h3>
                                <span style={{ fontSize: 13, color: '#673DE6', cursor: 'pointer', fontWeight: 500 }}>Voir tout</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                                {PRODUCTS.map(product => (
                                    <div
                                        key={product.id}
                                        onClick={() => setSelectedProduct(product)}
                                        style={{ background: 'white', borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'; }}
                                    >
                                        <div style={{ height: 180, overflow: 'hidden', position: 'relative' }}>
                                            <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            {!product.stock && <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.7)', color: 'white', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>Épuisé</div>}
                                        </div>
                                        <div style={{ padding: 16 }}>
                                            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{product.category}</div>
                                            <div style={{ fontWeight: 600, marginBottom: 8, color: '#1e293b', fontSize: 15 }}>{product.name}</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ color: '#0f172a', fontWeight: 700 }}>{product.price}</span>
                                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a' }}>
                                                    <ShoppingBag size={14} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Embedded Chat Widget */}
            <div style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 20 }}>
                <DemoChatStore context={selectedProduct} />
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
