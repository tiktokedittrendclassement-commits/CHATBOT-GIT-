import { NextResponse } from 'next/server'
import { Resend } from 'resend'

let resend;
const getResend = () => {
    if (!resend && process.env.RESEND_API_KEY) {
        resend = new Resend(process.env.RESEND_API_KEY);
    }
    return resend;
};

export async function POST(req) {
    try {
        const { to, subject, body, chatbotName, senderName, replyTo } = await req.json()

        // Validation de l'email destinataire
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        if (!to || !emailRegex.test(to.trim())) {
            return NextResponse.json({ error: 'Adresse email destinataire invalide' }, { status: 400 })
        }

        if (!process.env.RESEND_API_KEY) {
            console.log('--- EMAIL SIMULATION (No API Key) ---')
            console.log(`To: ${to}`)
            console.log(`Subject: ${subject}`)
            console.log(`Body: ${body}`)
            return NextResponse.json({ success: true, simulated: true })
        }

        const { data, error } = await getResend().emails.send({
            from: `${senderName || chatbotName || 'Vendo'} <contact@usevendo.com>`,
            to: [to],
            reply_to: replyTo || undefined,
            subject: subject || `Nouveau message de ${chatbotName || 'ton assistant'}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
                    <h2 style="color: #7c3aed;">Bonjour !</h2>
                    <div style="margin-top: 20px; line-height: 1.6;">
                        ${body}
                    </div>
                    <hr style="margin-top: 30px; border: none; border-top: 1px solid #e2e8f0;" />
                    <p style="font-size: 12px; color: #64748b;">
                        Envoyé via <strong>${chatbotName || 'Vendo Assistant'}</strong>
                    </p>
                </div>
            `,
        })

        if (error) {
            console.error('[API Send Email] Resend Error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, id: data.id })

    } catch (error) {
        console.error('[API Send Email] Critical Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
