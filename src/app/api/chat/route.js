import { NextResponse } from 'next/server'
import { generateChatResponse } from '@/lib/deepseek'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { VENDO_KNOWLEDGE_BASE } from '@/lib/vendo_knowledge'

// Admin client to bypass RLS for credit checks
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

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
            const { data, error: botError } = await supabase
                .from('chatbots')
                .select('name, system_prompt, data_sources, user_id')
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
                if (messageCount >= 1000) {
                    return NextResponse.json({ role: 'assistant', content: 'Limite de 1000 messages atteinte (Plan Gratuit).' });
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
                            // user_id removed as it doesn't exist in schema
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

        if (convId) {
            try {
                const lastUserMsg = messages[messages.length - 1];
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
