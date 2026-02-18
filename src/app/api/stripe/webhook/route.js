
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req) {
    const payload = await req.text()
    const signature = req.headers.get('stripe-signature')

    // Note: In real production, verify signature here using stripe.webhooks.constructEvent
    // For now, we simulate the webhook processing

    try {
        const event = JSON.parse(payload)

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object
            const userId = session.client_reference_id
            const planTier = session.metadata.plan_tier

            if (userId && planTier) {
                // Upgrade user plan
                await supabase
                    .from('profiles')
                    .update({ plan_tier: planTier })
                    .eq('id', userId)

                console.log(`User ${userId} upgraded to ${planTier}`)
            }
        }

        return NextResponse.json({ received: true })
    } catch (err) {
        console.error('Webhook Error:', err.message)
        return NextResponse.json({ error: 'Webhook Error' }, { status: 400 })
    }
}
