import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Check ALL bots
    const { data: bots, error: botErr } = await supabase.from('chatbots').select('id, name, user_id, collect_emails')
    // Check ALL leads
    const { data: leads, error: leadsErr } = await supabase.from('leads').select('*').order('captured_at', { ascending: false }).limit(20)
    // Check current session profile if we can (hard but we can use service role)

    return NextResponse.json({ bots, leads, botErr, leadsErr })
}
