
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req) {
    try {
        const { shop, accessToken, chatbotId } = await req.json()

        if (!shop || !accessToken || !chatbotId) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
        }

        // Fetch products from Shopify
        const response = await fetch(`https://${shop}/admin/api/2024-01/products.json`, {
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'Content-Type': 'application/json'
            }
        })

        const { products } = await response.json()

        // Format products for AI context
        const contextString = products.map(p => {
            return `Produit: ${p.title}\nDescription: ${p.body_html.replace(/<[^>]*>?/gm, '')}\nPrix: ${p.variants[0]?.price}€\nID: ${p.id}`
        }).join('\n\n')

        // Update chatbot data sources
        await supabase
            .from('chatbots')
            .update({ data_sources: contextString })
            .eq('id', chatbotId)

        return NextResponse.json({ success: true, count: products.length })
    } catch (error) {
        console.error('Shopify Sync Error:', error)
        return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
    }
}
