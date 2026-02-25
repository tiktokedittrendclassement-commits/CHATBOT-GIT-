import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Service role client to bypass RLS and delete from auth.users
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
    try {
        // Get the authorization token from the request
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 })
        }

        const token = authHeader.replace('Bearer ', '')

        // 1. Get the user from the token
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        console.log(`[Account Deletion] Deleting user: ${user.id} (${user.email})`)

        // 2. Delete the user from Supabase Auth
        // This will trigger "ON DELETE CASCADE" for the profiles table and other related tables
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

        if (deleteError) {
            console.error('[Account Deletion] Delete error:', deleteError)
            return NextResponse.json({ error: 'Failed to delete account', details: deleteError.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: 'Account deleted successfully' })

    } catch (error) {
        console.error('[Account Deletion] Critical error:', error)
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
    }
}
