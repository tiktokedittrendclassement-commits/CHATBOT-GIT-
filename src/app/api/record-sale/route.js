import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use Admin client to bypass RLS for sales recording
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(req) {
    try {
        const { chatbotId, amount, currency, visitorId } = await req.json()

        if (!chatbotId || !amount) {
            return NextResponse.json({ error: 'Missing chatbotId or amount' }, { status: 400 })
        }

        console.log(`[API Record Sale] Recording ${amount} ${currency || 'EUR'} for bot ${chatbotId}`)

        // Record the sale
        const { data, error } = await supabaseAdmin
            .from('sales')
            .insert({
                chatbot_id: chatbotId,
                amount: parseFloat(amount),
                currency: currency || 'EUR',
                status: 'completed'
            })
            .select()

        if (error) {
            console.error('[API Record Sale] Database error:', error)
            return NextResponse.json({ error: 'Failed to record sale in database' }, { status: 500 })
        }

        const response = NextResponse.json({ success: true, saleId: data[0].id })

        // Add CORS headers
        response.headers.set('Access-Control-Allow-Origin', '*')
        response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type')

        return response

    } catch (error) {
        console.error('[API Record Sale] CRITICAL ERROR:', error)
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
