import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email'

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
        const { subject, body, userId, senderName: reqSenderName, replyTo: reqReplyTo } = await req.json()

        if (!userId || !subject || !body) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        console.log(`[API Campaign] Starting campaign for user: ${userId}`);

        const supabaseAdmin = getSupabaseAdmin()

        // 1. Get user profile for SMTP settings
        const { data: profile, error: profError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (profError) {
            console.error('[API Campaign] Profile error:', profError)
        }

        // 2. Get all chatbots for this user
        const { data: chatbots, error: botError } = await supabaseAdmin
            .from('chatbots')
            .select('id, name, custom_sender_name, reply_to')
            .eq('user_id', userId)

        if (botError) {
            console.error('[API Campaign] Bot error:', botError)
            return NextResponse.json({ error: 'Failed to fetch chatbots' }, { status: 500 })
        }

        if (!chatbots || chatbots.length === 0) {
            return NextResponse.json({ success: true, sentCount: 0, message: 'Aucun chatbot trouvé.' })
        }

        const botIds = chatbots.map(b => b.id)

        // 3. Get all leads for these chatbots
        const { data: leads, error: leadError } = await supabaseAdmin
            .from('leads')
            .select('email')
            .in('chatbot_id', botIds)

        if (leadError) {
            console.error('[API Campaign] Lead error:', leadError)
            return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
        }

        // De-duplicate and validate emails
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        const uniqueEmails = [...new Set(
            leads
                .map(l => l.email.toLowerCase().trim())
                .filter(email => emailRegex.test(email))
        )]

        console.log(`[API Campaign] Leads found: ${leads.length}`);
        console.log(`[API Campaign] Valid Unique emails: ${uniqueEmails.length}`);

        if (uniqueEmails.length === 0) {
            console.log('[API Campaign] No leads found for these bots.');
            return NextResponse.json({ success: true, sentCount: 0, message: 'Aucun lead trouvé.' })
        }

        // 4. Send emails
        let successCount = 0
        let failCount = 0

        const smtpSettings = (profile && profile.use_custom_smtp) ? profile : null

        const fs = require('fs');
        fs.appendFileSync('lead_capture.log', `[${new Date().toISOString()}] CAMPAIGN START: Leads=${uniqueEmails.length}, SMTP=${!!smtpSettings}\n`);

        for (const email of uniqueEmails) {
            try {
                const firstBot = chatbots[0]
                const senderName = reqSenderName || firstBot?.custom_sender_name || firstBot?.name || 'Vendo'
                const replyTo = reqReplyTo || firstBot?.reply_to

                const result = await sendEmail({
                    to: email,
                    subject,
                    body,
                    userId,
                    chatbotName: firstBot?.name,
                    senderName,
                    replyTo,
                    smtpSettings
                });

                if (result.success) {
                    successCount++;
                } else {
                    failCount++;
                }

                fs.appendFileSync('lead_capture.log', `[${new Date().toISOString()}] CAMPAIGN LEAD ${email}: ${JSON.stringify(result)}\n`);
            } catch (err) {
                console.error(`[API Campaign] Critical error for ${email}:`, err);
                failCount++;
                fs.appendFileSync('lead_capture.log', `[${new Date().toISOString()}] CAMPAIGN LEAD ${email} ERROR: ${err.message}\n`);
            }
        }

        fs.appendFileSync('lead_capture.log', `[${new Date().toISOString()}] CAMPAIGN END: Success=${successCount}, Fail=${failCount}\n`);

        return NextResponse.json({
            success: true,
            sentCount: successCount,
            failCount: failCount,
            totalLeads: uniqueEmails.length,
            providerUsed: smtpSettings ? 'SMTP' : 'Resend'
        })

    } catch (error) {
        console.error('[API Send Campaign] Critical Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
