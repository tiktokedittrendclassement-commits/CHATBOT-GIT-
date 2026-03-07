import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { createClient } from '@supabase/supabase-js'

const getSupabaseAdmin = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return null
    return createClient(url, key)
}

export async function POST(req) {
    try {
        const { to, subject, body, userId: reqUserId, chatbotName, senderName, replyTo } = await req.json()

        // Validation de l'email destinataire
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        if (!to || !emailRegex.test(to.trim())) {
            return NextResponse.json({ error: 'Adresse email destinataire invalide' }, { status: 400 })
        }

        let smtpSettings = null
        if (reqUserId) {
            const supabaseAdmin = getSupabaseAdmin()
            if (supabaseAdmin) {
                const { data: profile } = await supabaseAdmin
                    .from('profiles')
                    .select('smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from, use_custom_smtp')
                    .eq('id', reqUserId)
                    .single()

                if (profile && profile.use_custom_smtp) {
                    smtpSettings = profile
                }
            }
        }

        const result = await sendEmail({
            to,
            subject,
            body,
            userId: reqUserId,
            chatbotName,
            senderName,
            replyTo,
            smtpSettings
        })

        return NextResponse.json(result)

    } catch (error) {
        console.error('[API Send Email] Critical Error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
