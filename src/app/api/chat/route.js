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
                .select('name, system_prompt, data_sources, user_id, welcome_email_subject, welcome_email_body')
                .eq('id', chatbotId)
                .single();

            if (botError || !data) {
                return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
            }
            chatbot = data;
            systemInstruction = `Ton nom est ${chatbot.name || 'Assistant'}.\n` + (chatbot.system_prompt || 'You are a helpful assistant.') + GLOBAL_RULES;
            if (chatbot.data_sources) systemInstruction += `\n\nCONTEXT:\n${chatbot.data_sources}`;
        }

        // 2. Credits Check (Only for custom bots)
        if (!isSystemBot) {
            const { data: profile, error: profileError } = await supabaseAdmin
                .from('profiles')
                .select('credits_balance, plan_tier')
                .eq('id', chatbot.user_id)
                .single();

            if (profileError || !profile || (profile.credits_balance !== undefined && profile.credits_balance <= 0)) {
                return NextResponse.json({
                    role: 'assistant',
                    content: `System: This chatbot has run out of credits. Please contact the site owner.`
                });
            }

            // Optional: Free plan limit check
            if (profile.plan_tier === 'free' || !profile.plan_tier) {
                const { data: messageCount } = await supabaseAdmin.rpc('get_user_message_count', { p_user_id: chatbot.user_id });
                if (messageCount >= 100) {
                    return NextResponse.json({ role: 'assistant', content: 'Limite de 100 messages atteinte (Plan Gratuit).' });
                }
            }
        }

        // 3. Generate AI Response
        responseText = await generateChatResponse(messages, systemInstruction);

        // 4. Credits Deduction & Storage
        if (!isSystemBot) {
            try {
                const { error: deductError } = await supabaseAdmin.rpc('decrement_balance', { p_user_id: chatbot.user_id, p_amount: 100 });
                if (deductError) console.error('[API Chat] Credit deduction error:', deductError);
            } catch (err) {
                console.error('[API Chat] critical deduction error:', err);
            }
        }

        let convId = conversationId;
        const isValidUuid = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        // Session Management: Lookup existing or create new
        if (!convId && visitorId && isValidUuid(chatbotId)) {
            try {
                console.log(`[API Chat] No convId. Looking up visitor: ${visitorId} for bot: ${chatbotId}`);
                const { data: exist, error: findError } = await supabaseAdmin
                    .from('conversations')
                    .select('id')
                    .eq('chatbot_id', chatbotId)
                    .eq('visitor_id', visitorId)
                    .limit(1)
                    .maybeSingle();

                if (findError) console.error('[API Chat] Error finding conversation:', findError);

                if (exist) {
                    convId = exist.id;
                    console.log(`[API Chat] Found existing conversation: ${convId}`);
                } else {
                    console.log('[API Chat] No existing conversation. Creating new one...');
                    const { data: newConv, error: createError } = await supabaseAdmin
                        .from('conversations')
                        .insert({
                            chatbot_id: chatbotId,
                            visitor_id: visitorId,
                        })
                        .select('id')
                        .single();

                    if (createError) {
                        console.error('[API Chat] ERROR creating conversation:', createError);
                    } else {
                        convId = newConv?.id;
                        console.log(`[API Chat] Created new conversation: ${convId}`);
                    }
                }
            } catch (err) {
                console.error('[API Chat] Critical conversation management error:', err);
            }
        }

        // 5. Detect & Capture Leads (Email detection)
        const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
        const lastUserMsg = messages[messages.length - 1];
        const detectedEmails = lastUserMsg.content.match(emailRegex);

        if (detectedEmails && detectedEmails.length > 0 && isValidUuid(chatbotId)) {
            const email = detectedEmails[0].toLowerCase();
            console.log(`[API Chat] Email detected: ${email}. Saving lead...`);

            try {
                // Save lead (upsert to avoid duplicates for same visitor/bot)
                await supabaseAdmin.from('leads').upsert({
                    chatbot_id: chatbotId,
                    email: email,
                    visitor_id: visitorId,
                    source_page: pageUrl
                }, { onConflict: 'chatbot_id,email' });

                console.log(`[API Chat] Lead saved successfully.`);

                // 6. Automated Email Notification
                if (process.env.NEXT_PUBLIC_SITE_URL || req.headers.get('host')) {
                    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `http://${req.headers.get('host')}`;
                    try {
                        await fetch(`${baseUrl}/api/send-email`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                to: profile?.email || 'admin@usevendo.com', // Notification to bot owner
                                subject: `🎉 Nouveau Lead : ${email}`,
                                body: `Un nouveau lead a été capturé par ton chatbot <strong>${chatbot.name}</strong>.<br><br><strong>Email :</strong> ${email}<br><strong>Page :</strong> ${pageUrl || 'Inconnue'}`,
                                chatbotName: chatbot.name
                            })
                        });
                        console.log(`[API Chat] Notification email triggered.`);
                    } catch (eError) {
                        console.error('[API Chat] Failed to trigger notification email:', eError);
                    }
                }

                // 7. Automated Responder (Welcome Email to Visitor)
                if (chatbot.welcome_email_body && (process.env.NEXT_PUBLIC_SITE_URL || req.headers.get('host'))) {
                    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `http://${req.headers.get('host')}`;
                    try {
                        await fetch(`${baseUrl}/api/send-email`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                to: email,
                                subject: chatbot.welcome_email_subject || 'Merci de votre visite !',
                                body: chatbot.welcome_email_body,
                                chatbotName: chatbot.name
                            })
                        });
                        console.log(`[API Chat] Automated welcome email triggered for lead: ${email}`);
                    } catch (wrError) {
                        console.error('[API Chat] Failed to trigger welcome email:', wrError);
                    }
                }
            } catch (leadError) {
                console.error('[API Chat] Error saving lead (Table might not exist yet):', leadError);
            }
        }

        if (convId) {
            try {
                console.log(`[API Chat] Storing messages for conv: ${convId}`);
                const { error: msgInsertError } = await supabaseAdmin.from('messages').insert([
                    { conversation_id: convId, role: 'user', content: lastUserMsg.content, page_url: pageUrl },
                    { conversation_id: convId, role: 'assistant', content: responseText }
                ]);
                if (msgInsertError) console.error('[API Chat] Error storing messages:', msgInsertError);
            } catch (err) {
                console.error('[API Chat] Critical message storage error:', err);
            }
        } else {
            console.warn(`[API Chat] Skipping message storage. Bot ID: ${chatbotId} | Visitor: ${visitorId} | Is UUID: ${isValidUuid(chatbotId)}`);
        }

        return NextResponse.json({
            role: 'assistant',
            content: responseText,
            debugInfo: {
                convId,
                visitorId,
                chatbotId,
                botOwnerId: chatbot?.user_id,
                storageSkipped: !convId
            }
        });

    } catch (error) {
        console.error('--- CHAT API ERROR ---', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
