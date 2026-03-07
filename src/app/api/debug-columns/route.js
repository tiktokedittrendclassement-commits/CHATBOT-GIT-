import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Query to check columns of leads table
    const { data, error } = await supabase.rpc('get_leads_columns'); // If we have an RPC, else we use a raw query if possible via another way

    // Alternatively, just try to select * and see the keys of the first row
    const { data: firstRow } = await supabase.from('leads').select('*').limit(1);

    return NextResponse.json({
        columns: firstRow?.[0] ? Object.keys(firstRow[0]) : "No rows found to check columns",
        error
    })
}
