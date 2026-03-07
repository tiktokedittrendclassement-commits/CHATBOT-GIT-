import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Test direct upsert with NO ID
    const chatbotId = "576df00c-0f88-4cc6-a1e8-8a7b2703f921";
    const testEmail = "test_upsert_" + Date.now() + "@example.com";

    const { data, error } = await supabase.from('leads').upsert({
        chatbot_id: chatbotId,
        email: testEmail,
        visitor_id: 'test_upsert_manual',
        source_page: '/debug-test'
    }, { onConflict: 'chatbot_id,email' }).select()

    return NextResponse.json({ success: !error, data, error })
}
