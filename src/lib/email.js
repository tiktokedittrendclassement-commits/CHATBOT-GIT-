import { Resend } from 'resend';
import nodemailer from 'nodemailer';

/**
 * Common function to send email. 
 * If userId and SMTP settings are provided, it uses nodemailer (SMTP).
 * Otherwise it falls back to Resend or Simulation.
 */
export async function sendEmail({ to, subject, body, userId, chatbotName, senderName, replyTo, smtpSettings = null }) {
    console.log(`[Email Utility] Sending email to ${to}...`);

    // 1. Check if we should use custom SMTP
    if (smtpSettings && smtpSettings.use_custom_smtp && smtpSettings.smtp_host) {
        try {
            console.log(`[Email Utility] Using custom SMTP: ${smtpSettings.smtp_host}`);

            const transporter = nodemailer.createTransport({
                host: smtpSettings.smtp_host,
                port: smtpSettings.smtp_port || 587,
                secure: smtpSettings.smtp_port === 465, // true for 465, false for others
                auth: {
                    user: smtpSettings.smtp_user,
                    pass: smtpSettings.smtp_pass,
                },
            });

            const info = await transporter.sendMail({
                from: `${senderName || chatbotName || 'Assistant'} <${smtpSettings.smtp_from || smtpSettings.smtp_user}>`,
                to: to,
                replyTo: replyTo || undefined,
                subject: subject || `Nouveau message de ${chatbotName || 'ton assistant'}`,
                html: generateEmailHtml(body, chatbotName, senderName),
            });

            console.log(`[Email Utility] SMTP Success: ${info.messageId}`);
            return { success: true, id: info.messageId, provider: 'smtp' };
        } catch (error) {
            console.error('[Email Utility] SMTP Error:', error);
            throw new Error(`Erreur SMTP : ${error.message}`);
        }
    }

    // 2. If a userId is provided but SMTP is not active/configured, we STOP here.
    // We do NOT want to send using Vendo's generic Resend email for user communications.
    if (userId) {
        console.warn(`[Email Utility] Blocked: User ${userId} has no SMTP configured. Fallback to Resend disabled.`);
        throw new Error("SMTP non configuré. Veuillez activer votre propre email pro dans les paramètres pour envoyer des messages.");
    }

    // 3. Fallback to Resend ONLY for internal/system use (where no userId is provided)
    if (process.env.RESEND_API_KEY) {
        try {
            console.log(`[Email Utility] Using Resend`);
            const resend = new Resend(process.env.RESEND_API_KEY);
            const { data, error } = await resend.emails.send({
                from: `${senderName || chatbotName || 'Vendo'} <team@usevendo.com>`,
                to: [to],
                reply_to: replyTo || undefined,
                subject: subject || `Nouveau message de ${chatbotName || 'ton assistant'}`,
                html: generateEmailHtml(body, chatbotName, senderName),
            });

            if (error) {
                console.error('[Email Utility] Resend Error:', error);
                throw new Error(error.message);
            }

            return { success: true, id: data.id, provider: 'resend' };
        } catch (error) {
            console.error('[Email Utility] Resend Exception:', error);
            throw error;
        }
    }

    // 3. Fallback to Simulation
    console.log('--- EMAIL SIMULATION (No configuration) ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    return { success: true, simulated: true };
}

function generateEmailHtml(body, chatbotName, senderName) {
    return `
        <div style="font-family: sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #7c3aed; margin-top: 0;">Bonjour !</h2>
            <div style="margin-top: 20px; line-height: 1.6; color: #334155;">
                ${body}
            </div>
            <hr style="margin-top: 30px; border: none; border-top: 1px solid #e2e8f0;" />
            <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">
                Envoyé via <strong>${chatbotName || senderName || 'Vendo Assistant'}</strong>
            </p>
        </div>
    `;
}
