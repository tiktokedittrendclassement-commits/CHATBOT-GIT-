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
    const { data, error } = await supabaseAdmin
        .from('chatbots')
        .select('id, name, color, system_prompt, data_sources, reseller_token, logo_url')
        .eq('reseller_token', token)
        .single()

    if (error || !data) {
        return NextResponse.json({ error: 'Invalid token or chatbot not found' }, { status: 404 })
    }

    return NextResponse.json(data)
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
