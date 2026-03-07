import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const getSupabaseAdmin = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )
}

export async function GET(req) {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
        return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // 1. Fetch chatbot info
    const { data: bot, error: botErr } = await supabaseAdmin
        .from('chatbots')
        .select('*')
        .eq('reseller_token', token)
        .single()

    if (botErr || !bot) {
        return NextResponse.json({ error: 'Invalid token or chatbot not found' }, { status: 404 })
    }

    // 2. Fetch stats
    // Count conversations
    const { count: convCount } = await supabaseAdmin
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('chatbot_id', bot.id)

    // Count messages
    const { count: msgCount } = await supabaseAdmin
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('chatbot_id', bot.id)

    // Calculate revenue
    const { data: sales } = await supabaseAdmin
        .from('sales')
        .select('amount')
        .eq('chatbot_id', bot.id)

    const revenue = sales?.reduce((acc, s) => acc + Number(s.amount), 0) || 0

    // Fetch leads (recent conversations with contact info)
    const { data: leads } = await supabaseAdmin
        .from('conversations')
        .select('id, visitor_email, visitor_phone, created_at')
        .eq('chatbot_id', bot.id)
        .or('visitor_email.not.is.null,visitor_phone.not.is.null')
        .order('created_at', { ascending: false })
        .limit(5)

    // Fetch recent activity
    const { data: recentConvs } = await supabaseAdmin
        .from('conversations')
        .select('id, visitor_id, created_at')
        .eq('chatbot_id', bot.id)
        .order('created_at', { ascending: false })
        .limit(5)

    return NextResponse.json({
        ...bot,
        stats: {
            conversations: convCount || 0,
            messages: msgCount || 0,
            leads: leads || [],
            revenue: revenue,
            recentConversations: recentConvs || []
        }
    })
}

export async function PATCH(req) {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')
    const body = await req.json()

    if (!token) {
        return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // List of allowed fields for clients to edit
    const allowedFields = ['name', 'color', 'system_prompt', 'data_sources', 'logo_url']
    const updateData = {}

    allowedFields.forEach(field => {
        if (body[field] !== undefined) {
            updateData[field] = body[field]
        }
    })

    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin
        .from('chatbots')
        .update({ ...updateData, updated_at: new Date() })
        .eq('reseller_token', token)
        .select()
        .single()

    if (error) {
        console.error('[Reseller API Error]:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}
