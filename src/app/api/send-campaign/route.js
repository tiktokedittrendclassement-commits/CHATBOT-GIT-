import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

// Initialize Resend lazily only if API key is present
let resend;
const getResend = () => {
    if (!resend && process.env.RESEND_API_KEY) {
        resend = new Resend(process.env.RESEND_API_KEY);
    }
    return resend;
};

// Admin client to bypass RLS for bulk operations
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(req) {
    try {
        const { subject, body, userId } = await req.json()

        if (!userId || !subject || !body) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        console.log(`[API Campaign] Starting campaign for user: ${userId}`);

        // 1. Get all chatbots for this user to get settings and botIds
        const { data: chatbots, error: botError } = await supabaseAdmin
            .from('chatbots')
            .select('id, name, sender_name, reply_to')
            .eq('user_id', userId)

        if (botError) {
            console.error('[API Campaign] Bot error:', botError)
            return NextResponse.json({ error: 'Failed to fetch chatbots' }, { status: 500 })
        }

        if (!chatbots || chatbots.length === 0) {
            return NextResponse.json({ success: true, sentCount: 0, message: 'Aucun chatbot trouvé.' })
        }

        const botIds = chatbots.map(b => b.id)

        // 2. Get all leads for these chatbots
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

        console.log(`[API Campaign] Chatbots found: ${chatbots.length}`);
        console.log(`[API Campaign] Bot IDs: ${JSON.stringify(botIds)}`);
        console.log(`[API Campaign] Leads found: ${leads.length}`);
        console.log(`[API Campaign] Valid Unique emails: ${uniqueEmails.length}`);

        if (uniqueEmails.length === 0) {
            console.log('[API Campaign] No leads found for these bots.');
            return NextResponse.json({ success: true, sentCount: 0, message: 'Aucun lead trouvé.' })
        }

        // 3. Send emails
        let successCount = 0
        let failCount = 0

        console.log(`[API Campaign] Sending emails via Resend SDK...`);

        // Use Promise.all with some limit or just sequential for reliability on dev
        for (const email of uniqueEmails) {
            try {
                if (!process.env.RESEND_API_KEY) {
                    console.log(`[Campaign Simulation] To: ${email} | Sub: ${subject}`);
                    successCount++;
                    continue;
                }

                const firstBot = chatbots[0]
                const senderName = firstBot?.sender_name || firstBot?.name || 'Vendo'
                const replyTo = firstBot?.reply_to

                const { data, error } = await getResend().emails.send({
                    from: `${senderName} <team@usevendo.com>`,
                    to: [email],
                    reply_to: replyTo || undefined,
                    subject: subject,
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
                            <h2 style="color: #7c3aed;">Bonjour !</h2>
                            <div style="margin-top: 20px; line-height: 1.6;">
                                ${body}
                            </div>
                            <hr style="margin-top: 30px; border: none; border-top: 1px solid #e2e8f0;" />
                            <p style="font-size: 12px; color: #64748b;">
                                Envoyé via <strong>${senderName}</strong>
                            </p>
                        </div>
                    `,
                });

                if (error) {
                    console.error(`[API Campaign] Error for ${email}:`, error);
                    failCount++;
                } else {
                    successCount++;
                }
            } catch (err) {
                console.error(`[API Campaign] Critical error for ${email}:`, err);
                failCount++;
            }
        }

        return NextResponse.json({
            success: true,
            sentCount: successCount,
            failCount: failCount,
            totalLeads: uniqueEmails.length
        })

    } catch (error) {
        console.error('[API Send Campaign] Critical Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
