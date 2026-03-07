
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const getSupabaseAdmin = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
        throw new Error('Missing Supabase environment variables for Admin client')
    }

    return createClient(url, key)
}

export async function POST(req) {
    try {
        const { chatbotId, visitorId, cartItems, totalAmount, currency, pageUrl } = await req.json()

        if (!chatbotId || !visitorId) {
            return NextResponse.json({ error: 'Missing chatbotId or visitorId' }, { status: 400 })
        }

        console.log(`[API Abandoned Cart] Recording cart for visitor ${visitorId} for bot ${chatbotId}`)

        const supabaseAdmin = getSupabaseAdmin()

        // Upsert abandoned cart for this visitor/chatbot
        const { data, error } = await supabaseAdmin
            .from('abandoned_carts')
            .upsert({
                chatbot_id: chatbotId,
                visitor_id: visitorId,
                cart_items: cartItems || [],
                total_amount: parseFloat(totalAmount || 0),
                currency: currency || 'EUR',
                last_page_url: pageUrl,
                status: 'pending', // Wait for checkout to mark as converted
                updated_at: new Date()
            }, { onConflict: 'chatbot_id,visitor_id' })
            .select()

        if (error) {
            console.error('[API Abandoned Cart] Database error:', error)
            return NextResponse.json({ error: 'Failed to record cart in database' }, { status: 500 })
        }

        const response = NextResponse.json({ success: true, cartId: data[0].id })

        // Add CORS headers
        response.headers.set('Access-Control-Allow-Origin', '*')
        response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type')

        return response

    } catch (error) {
        console.error('[API Abandoned Cart] CRITICAL ERROR:', error)
        return NextResponse.json({ error: 'Internal Server Error: ' + error.message }, { status: 500 })
    }
}

export async function OPTIONS() {
    const response = new NextResponse(null, { status: 204 })
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    return response
}
