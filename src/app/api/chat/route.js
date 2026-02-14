
import { NextResponse } from 'next/server'
import { generateChatResponse } from '@/lib/deepseek'
import { supabase } from '@/lib/supabase' // Use admin client if needed, but here we can check bot ID

// Note: In a real app we need a Service Role client to verify ownership/limits securely 
// without relying on client-side keys. Since we are using the public client in lib, 
// we should probably upgrade it to use service role for API routes.
// But for "ultra stable" MVP, we can reuse if we are careful.
// Actually, for API routes, we can use `createClient` with SERVICE_ROLE key to bypass RLS.
// I'll stick to the provided client for now, but RLS might block us if we aren't auth'd.
// The widget sends requests anonymously.
// We need to bypass RLS for "public" widget access to insert messages?
// Or we rely on the public policies we set in schema.sql.

export async function POST(req) {
    try {
        const { messages, chatbotId, visitorId, conversationId, pageUrl } = await req.json()

        if (!chatbotId || !messages) {
            return NextResponse.json({ error: 'Missing chatbotId or messages' }, { status: 400 })
        }

        // --- DEMO MODE FOR LANDING PAGE ---
        if (chatbotId === 'DEMO') {
            const systemInstruction = `You are "Mon Assistant Vendo", the AI sales assistant for "Lumina Fashion".
            
            YOUR GOAL: Be helpful and concise.
            TONE: Professional, warm, but straight to the point.
            LANGUAGE: French.

            CRITICAL RULES:
            1. KEEP RESPONSES SHORT (Max 2-3 sentences).
            2. ONLY use the product/store context if the user's question is relevant to it.
            3. If the user says "Hello", "Yo", or "Salut", just answer politely (e.g., "Bonjour ! En quoi puis-je vous aider ?") without trying to sell immediately.
            4. Act like a real human employee, not a robot reading a script.

            STORE CONTEXT:
            - Brand: Lumina Fashion.
            - Delivery: Free 24/48h Colissimo.
            - Returns: Free within 30 days.

            PRODUCTS (Reference only if asked):
            1. Sneakers Urban Pulse (129.90€) - Futuristic, memory foam. Best seller. Normal fit.
            2. Montre Chrono Gold (249.00€) - Waterproof 50m, Sapphire glass.
            3. Sac Voyage Cuir (189.00€) - Genuine Leather, 15" Laptop.

            Don't mention you are an AI or Demo unless asked.`

            const responseText = await generateChatResponse(messages, systemInstruction)

            return NextResponse.json({
                role: 'assistant',
                content: responseText
            })
        }
        // ----------------------------------

        // 1. Fetch Chatbot Config (System Prompt & Data Sources)
        // We need to use a client that can read this. Our public policy allows reading chatbots.
        const { data: chatbot, error: botError } = await supabase
            .from('chatbots')
            .select('system_prompt, data_sources, user_id')
            .eq('id', chatbotId)
            .single()

        if (botError || !chatbot) {
            return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 })
        }

        // 0. Check User Credits & Message Limits
        const { data: profile } = await supabase
            .from('profiles')
            .select('credits_balance, plan_tier')
            .eq('id', chatbot.user_id)
            .single()

        if (!profile || profile.credits_balance <= 0) {
            return NextResponse.json({
                role: 'assistant',
                content: 'System: This chatbot has run out of credits. Please contact the site owner.'
            }) // Return as message so looking natural, or error 402
        }

        // Check message limit for free plan users
        if (profile.plan_tier === 'free' || !profile.plan_tier) {
            // Count total messages for this user using RPC function
            const { data: messageCount, error: countError } = await supabase
                .rpc('get_user_message_count', { p_user_id: chatbot.user_id })

            if (!countError && messageCount >= 1000) {
                return NextResponse.json({
                    role: 'assistant',
                    content: 'Vous avez atteint la limite de 1000 messages du plan gratuit. Veuillez passer à un plan payant pour continuer à utiliser ce chatbot.'
                })
            }
        }

        // 2. Prepare Context
        let systemInstruction = chatbot.system_prompt || 'You are a helpful assistant.'
        if (chatbot.data_sources) {
            systemInstruction += `\n\nCONTEXT:\n${chatbot.data_sources}\n\nUse the above context to answer user questions.`
        }

        // 3. Generate AI Response
        // We only send the last few messages to save tokens/context window if needed, 
        // but DeepSeek V3 has a large window.
        const responseText = await generateChatResponse(messages, systemInstruction)

        // 4. Store Conversation & Deduct Credits
        // Create or Update Conversation
        // For MVP, we need a conversation ID. 
        // If client didn't send one, we create one. But dealing with "new" vs "existing" is tricky in one stateless call.
        // Client should send `conversationId` if it has one.
        // Let's assume client sends `conversationId` if available, else we create new.

        let convId = conversationId; // Use conversationId from request if provided

        // Deduct Cost (100 micros = 0.0001€)
        await supabase.rpc('decrement_balance', { p_user_id: chatbot.user_id, p_amount: 100 })

        // Log Usage (Optional but recommended)
        /* await supabase.from('usages').insert({ 
           user_id: chatbot.user_id, 
           chatbot_id: chatbotId, 
           tokens_used: 0, 
           credits_deducted: 1 
        }) */

        // Store Messages (Async to not block response time too much, but Next.js serverless might kill it)
        // Ideally use `waitUntil` or just await it.
        // We assume `conversationId` is managed by client-side or we return it?
        // Simplified: We don't store for this turn due to complexity of "visitor_id" session management 
        // without a proper conversation start endpoint. 
        // BUT User wants "Conversations Tab". So we MUST store.

        // Let's look up/create conversation based on visitorId + chatbotId?
        if (!convId && visitorId) {
            // Try find active conversation
            const { data: exist } = await supabase.from('conversations').select('id').eq('chatbot_id', chatbotId).eq('visitor_id', visitorId).limit(1).single()
            if (exist) convId = exist.id
            else {
                const { data: newConv } = await supabase.from('conversations').insert({ chatbot_id: chatbotId, visitor_id: visitorId }).select('id').single()
                convId = newConv?.id
            }
        }

        if (convId) {
            // Store User Msg
            const lastUserMsg = messages[messages.length - 1]
            await supabase.from('messages').insert({
                conversation_id: convId,
                role: 'user',
                content: lastUserMsg.content,
                page_url: pageUrl // Save URL if provided
            })
            // Store Bot Msg
            await supabase.from('messages').insert({ conversation_id: convId, role: 'assistant', content: responseText })
        }

        return NextResponse.json({
            role: 'assistant',
            content: responseText
        })
    } catch (error) {
        console.error('Chat API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
