import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { generateChatResponse } from '@/lib/deepseek'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { VENDO_KNOWLEDGE_BASE } from '@/lib/vendo_knowledge'

// Safe way to get admin client to avoid build-time issues
const getSupabaseAdmin = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
        throw new Error('Missing Supabase environment variables for Admin client')
    }

    return createClient(url, key)
}

export async function POST(req) {
    let chatbotId = 'UNKNOWN'; // For error logging
    try {
        const { messages, chatbotId: reqChatbotId, visitorId, conversationId, pageUrl } = await req.json();
        chatbotId = reqChatbotId;

        if (!chatbotId || !messages) {
            return NextResponse.json({ error: 'Missing chatbotId or messages' }, { status: 400 });
        }

        const GLOBAL_RULES = `
        CRITICAL RULES:
        1. NO MARKDOWN: Never use asterisks (*), bold (**), or italics (_) in your responses. Use plain text only.
        2. NATURAL VOICE: Speak like a real person, not an AI. Use a friendly, human tone.
        3. CONCISION: Keep responses short (max 2-3 sentences unless absolutely necessary).
        4. No "Je suis une IA" or "En tant qu'intelligence artificielle".
        `;



        let responseText = '';
        let systemInstruction = '';
        let chatbot = null;
        let isSystemBot = (chatbotId === 'DEMO' || chatbotId === 'VENDO_SUPPORT');
        const supabaseAdmin = getSupabaseAdmin()

        // 1. Determine Identity & Instructions
        if (chatbotId === 'DEMO') {
            const clientSystemMsg = messages.find(m => m.role === 'system');
            systemInstruction = (clientSystemMsg ? clientSystemMsg.content : `You are "Mon Assistant Vendo", the AI sales assistant for "Lumina Fashion".
                TONE: Professional, warm, but straight to the point.
                LANGUAGE: French.
                STORE CONTEXT: Brand: Lumina Fashion. Delivery: Free 24/48h Colissimo. Returns: Free within 30 days.`) + GLOBAL_RULES;
            chatbot = { name: 'Demo Bot', user_id: 'SYSTEM' };
        } else if (chatbotId === 'VENDO_SUPPORT') {
            systemInstruction = `Tu es Vendo, l'assistant expert de usevendo.com. Tutoiement, phrases courtes, vendeur dans l'âme.
            ${VENDO_KNOWLEDGE_BASE}
            ${GLOBAL_RULES}`;
            chatbot = { name: 'Vendo Support', user_id: 'SYSTEM' };
        } else {
            // Fetch Custom Bot Config
            const { data, error: botError } = await supabaseAdmin
                .from('chatbots')
                .select('name, system_prompt, data_sources, user_id, welcome_email_subject, welcome_email_body, custom_sender_name, reply_to, collect_emails, collect_phones')
                .eq('id', chatbotId)
                .single();

            if (botError || !data) {
                return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
            }
            chatbot = data;
            systemInstruction = `Ton nom est ${chatbot.name || 'Assistant'}.\n` + (chatbot.system_prompt || 'You are a helpful assistant.') + GLOBAL_RULES;
            if (chatbot.data_sources) systemInstruction += `\n\nCONTEXT:\n${chatbot.data_sources}`;

            // Proactive lead capture instructions
            if (chatbot.collect_emails) {
                systemInstruction += `\n\nEMAIL CAPTURE: You are authorized and encouraged to ask for the user's email address for follow-ups or to send information. If they give an email, accept it warmly.`;
            } else {
                systemInstruction += `\n\nNOTE: Email capture is currently DISABLED. If the user provides an email, politely inform them that email capture is not enabled on this chatbot and you cannot save it.`;
            }

            if (chatbot.collect_phones) {
                systemInstruction += `\n\nWHATSAPP/PHONE CAPTURE: You are authorized and encouraged to ask for the user's phone number to contact them via WhatsApp or for follow-ups. If they give a number, accept it warmly. Never refuse a phone number provided by the user.`;
            } else {
                systemInstruction += `\n\nNOTE: WhatsApp/Phone capture is currently DISABLED. If the user provides a phone number, politely inform them that phone capture is not enabled on this chatbot and you cannot save it.`;
            }




        }

        // 2. Fetch Profile & Check Advanced Features (Cart Recovery)
        let profile = null;
        if (!isSystemBot) {
            const { data: prof, error: profileError } = await supabaseAdmin
                .from('profiles')
                .select('credits_balance, plan_tier')
                .eq('id', chatbot.user_id)
                .single();

            profile = prof;

            if (profileError || !profile || (profile.credits_balance !== undefined && profile.credits_balance <= 0)) {
                return NextResponse.json({
                    role: 'assistant',
                    content: `Je ne peux pas traiter cette demande car le solde de crédits de ce chatbot est épuisé. Pour toute question, vous pouvez contacter le propriétaire du site.`
                });
            }

            // Abandoned Cart Context (Pro/Agency only)
            if (visitorId && (profile.plan_tier === 'pro' || profile.plan_tier === 'agency')) {
                const { data: cart } = await supabaseAdmin
                    .from('abandoned_carts')
                    .select('cart_items, total_amount, currency')
                    .eq('chatbot_id', chatbotId)
                    .eq('visitor_id', visitorId)
                    .single();

                if (cart && cart.cart_items && cart.cart_items.length > 0) {
                    const cartContext = cart.cart_items.map(i => `${i.name} (${i.quantity || 1}x)`).join(', ');
                    systemInstruction += `\n\nUSER CART INFO: The user currently has the following in their cart: ${cartContext}. Total: ${cart.total_amount} ${cart.currency}. 
                    If relevant, you can friendly remind them or offer help specifically about these products.`;
                }
            }

            // Free plan limit check
            if (profile.plan_tier === 'free' || !profile.plan_tier) {
                const { data: messageCount } = await supabaseAdmin.rpc('get_user_message_count', { p_user_id: chatbot.user_id });
                if (messageCount >= 100) {
                    return NextResponse.json({ role: 'assistant', content: 'Limite de 100 messages atteinte (Plan Gratuit).' });
                }
            }
        }
        const isValidUuid = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        // 3. Detect & Capture Leads BEFORE AI call
        const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
        const phoneRegex = /(\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})/g;
        const lastUserMsg = messages[messages.length - 1];
        let leadCaptured = false;

        // Detect contact info based on chatbot settings
        const detectedEmails = chatbot.collect_emails ? lastUserMsg.content.match(emailRegex) : null;
        const detectedPhones = chatbot.collect_phones ? lastUserMsg.content.match(phoneRegex) : null;

        const hasEmail = detectedEmails && detectedEmails.length > 0;
        const hasPhone = detectedPhones && detectedPhones.length > 0;

        if ((hasEmail || hasPhone) && isValidUuid(chatbotId)) {

            const email = hasEmail ? detectedEmails[0].toLowerCase() : null;
            const phone = hasPhone ? detectedPhones[0].trim() : null;

            // Allow saving if either email or phone is present
            if (!email && !phone) return;

            console.log(`[API Chat] Lead detected: Email=${email}, Phone=${phone}. Saving lead...`);


            try {
                // Use a more robust upsert. We identify by email/chatbot combination if possible.
                const fs = require('fs');
                const log = (m) => fs.appendFileSync('lead_capture.log', `[${new Date().toISOString()}] ${m}\n`);
                log(`Capture attempt for bot ${chatbotId}: email=${email}, phone=${phone}`);

                const { error: upsertError } = await supabaseAdmin.from('leads').insert({
                    chatbot_id: chatbotId,
                    email: email,
                    phone: phone,
                    visitor_id: visitorId,
                    source_page: pageUrl
                });

                if (upsertError) {
                    require('fs').appendFileSync('lead_capture.log', `[${new Date().toISOString()}] SAVE ERROR: ${upsertError.message} (Code: ${upsertError.code})\n`);
                    console.error('[API Chat] Lead save error:', upsertError);
                    if (upsertError.code === '23505') leadCaptured = true;
                }

                else {
                    require('fs').appendFileSync('lead_capture.log', `[${new Date().toISOString()}] SAVE SUCCESS: ${email || phone}\n`);
                    console.log(`[API Chat] Lead saved successfully.`);
                    leadCaptured = true;
                    // Add a hint to AI that capture was successful
                    systemInstruction += `\n\n[SYSTEM]: The user just provided their contact information (${email || phone}). It has been successfully saved to the database. Confirm to the user that you've received it and continue with their request.`;

                }

                // Automatic Welcome Email Send (Triggered whether it's new or existing lead)
                if (leadCaptured && email && chatbot.welcome_email_body) {
                    try {
                        const fs = require('fs');
                        fs.appendFileSync('lead_capture.log', `[${new Date().toISOString()}] TRIGGERING EMAIL to ${email} (Body length: ${chatbot.welcome_email_body.length})\n`);

                        const origin = req.headers.get('origin') || 'http://localhost:3000';
                        fetch(`${origin}/api/send-email`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                to: email,
                                userId: chatbot.user_id,
                                subject: chatbot.welcome_email_subject || `Bienvenue !`,
                                body: chatbot.welcome_email_body,
                                chatbotName: chatbot.name,
                                senderName: chatbot.custom_sender_name || chatbot.name,
                                replyTo: chatbot.reply_to
                            })
                        })
                            .then(async r => {
                                const resData = await r.json();
                                fs.appendFileSync('lead_capture.log', `[${new Date().toISOString()}] EMAIL RESULT: ${JSON.stringify(resData)}\n`);
                            })
                            .catch(err => {
                                fs.appendFileSync('lead_capture.log', `[${new Date().toISOString()}] EMAIL FETCH ERROR: ${err.message}\n`);
                            });
                    } catch (emailErr) {
                        console.error('[API Chat] Error starting email trigger:', emailErr);
                    }
                }
            } catch (leadError) {
                console.error('[API Chat] Error saving lead:', leadError);
            }
        }

        // 4. Generate AI Response
        // DeepSeek/OpenAI best practice: Place the system instruction as the FIRST message, 
        // but for specific overrides like "lead captured", we can also add it as a system message at the END to ensure it's prioritized.
        const fullMessagesForAI = [
            { role: 'system', content: systemInstruction },
            ...messages
        ];

        // If a lead was captured, we add a final reinforcement message to ensure AI acknowledges it
        if (leadCaptured) {
            fullMessagesForAI.push({
                role: 'system',
                content: `IMPORTANT: The contact information has been SECURELY SAVED. Do NOT ask the user what to do with it. Simply confirm the receipt warmly and continue.`
            });
        }

        responseText = await generateChatResponse(fullMessagesForAI, ""); // passing empty string as redundant system prompt if your lib handles it

        // 5. Credits Deduction & Storage
        if (!isSystemBot) {
            try {
                const { error: deductError } = await supabaseAdmin.rpc('decrement_balance', { p_user_id: chatbot.user_id, p_amount: 100 });
                if (deductError) console.error('[API Chat] Credit deduction error:', deductError);
            } catch (err) {
                console.error('[API Chat] critical deduction error:', err);
            }
        }

        let convId = conversationId;
        // Session Management: Lookup existing or create new
        if (!convId && visitorId && isValidUuid(chatbotId)) {
            try {
                const { data: exist, error: findError } = await supabaseAdmin
                    .from('conversations')
                    .select('id')
                    .eq('chatbot_id', chatbotId)
                    .eq('visitor_id', visitorId)
                    .limit(1)
                    .maybeSingle();

                if (exist) {
                    convId = exist.id;
                } else {
                    const { data: newConv, error: createError } = await supabaseAdmin
                        .from('conversations')
                        .insert({
                            chatbot_id: chatbotId,
                            visitor_id: visitorId,
                        })
                        .select('id')
                        .single();

                    if (!createError) convId = newConv?.id;
                }
            } catch (err) {
                console.error('[API Chat] Critical conversation management error:', err);
            }
        }

        if (convId) {
            try {
                await supabaseAdmin.from('messages').insert([
                    { conversation_id: convId, role: 'user', content: lastUserMsg.content, page_url: pageUrl },
                    { conversation_id: convId, role: 'assistant', content: responseText }
                ]);
            } catch (err) {
                console.error('[API Chat] Critical message storage error:', err);
            }
        }

        return NextResponse.json({
            role: 'assistant',
            content: responseText,
            debugInfo: {
                convId,
                visitorId,
                chatbotId,
                botOwnerId: chatbot?.user_id,
                leadCaptured,
                systemPromptUsed: systemInstruction.substring(0, 100) + "..."
            }
        });

    } catch (error) {
        console.error('--- CHAT API ERROR ---', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
