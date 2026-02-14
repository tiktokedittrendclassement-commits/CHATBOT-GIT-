import { NextResponse } from 'next/server'
import { generateChatResponse } from '@/lib/deepseek'
import { supabase } from '@/lib/supabase'

export async function POST(req) {
    try {
        const { chatbotId, userId } = await req.json()

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
        }

        // 1. Fetch recent user messages
        let query = supabase
            .from('messages')
            .select(`
                content,
                created_at,
                conversations!inner (
                    chatbot_id,
                    chatbots!inner (
                        user_id,
                        name
                    )
                )
            `)
            .eq('role', 'user')
            //.eq('conversations.chatbots.user_id', userId) // RLS usually handles this, but explicit check is good if we used admin client
            .order('created_at', { ascending: false })
            .limit(50)

        // Filter by chatbot if provided
        if (chatbotId && chatbotId !== 'all') {
            query = query.eq('conversations.chatbot_id', chatbotId)
        }

        // We need to filter by user ownership manually if the join filter doesn't work directly in one go with public client + RLS
        // But let's assume valid RLS for now or proper query construction.
        // Actually, inner join filtering on nested relation in Supabase JS:
        // .eq('conversations.chatbots.user_id', userId) works if relations are set.

        // Simpler approach for MVP: Fetch messages where conversation's chatbot belongs to user.
        // Let's rely on RLS if authenticated. 
        // If this is a server route called by client, we might need a service role client to ensure we get data, 
        // OR forward the user's session.
        // *CRITICAL*: The `supabase` import from `@/lib/supabase` usually uses the public anon key. 
        // If RLS is set to "Users can view messages for their bot conversations" (auth.uid() = chatbot owner),
        // WE CANNOT fetch this data without a logged-in user context in the `supabase` client.
        // The named export `supabase` is likely just a static client.
        // For API routes to work with RLS, we usually need `createRouteHandlerClient` (Next.js) or pass the session.
        // OR use a Service Role client to bypass RLS.
        // Given existing code references `import { supabase } from '@/lib/supabase'`, let's check if it has service role?
        // Usually it's public.
        // If I use public client here, `auth.uid()` is null/anon. The RLS `auth.uid() = user_id` will FAIL.

        // FIX: I will use a tailored query or assume I need to pass context.
        // Verification: `src/app/api/chat/route.js` imported `supabase` and seemed to work for public access?
        // Ah, `chat/route.js` works because public policies allow INSERT.
        // But SELECTing *user's* private stats requires Auth.

        // QUICK FIX for MVP without rewriting auth: Use a Service Role client specifically here?
        // Or assume the user calls this from the client side? 
        // Wait, this is a distinct API route. I will assume I can use `createClient` if needed, 
        // but simplest is to just use the shared client and hope the environment has the key, 
        // OR better: Execute this logic CLIENT-SIDE if possible? No, we want to hide the Prompt logic.

        // I'll try to implement it with the assumption that I can fetch data.
        // If not, I'll need to update `lib/supabase.js` or use `process.env.SUPABASE_SERVICE_ROLE_KEY`.
        // Let's assume standard `process.env.SUPABASE_SERVICE_ROLE_KEY` is available for server-side operations.

        /* 
        const adminClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        )
        */

        // However, I don't want to break if the key isn't set.
        // I will stick to the imported client and try. If it fails, I'll advise the user.
        // Actually, looking at `dashboard/page.js`, it fetches data client-side.
        // Maybe I should just fetch messages client-side and send them to this API for *analysis* only?
        // That avoids the Auth/RLS bottleneck on the server.
        // YES. That is smarter.
        // Client fetches messages -> Posts to API -> API analyzes.

        // RE-PLANNING: 
        // This API will receive `messages` array, not `userId`.
        // Much safer and simpler for Auth.

        const { messages, contextInfo } = await req.json()

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({
                summary: "Aucune donnée suffisante pour l'analyse.",
                topQuestions: [],
                recommendations: { prompt: "", missingData: [] }
            })
        }

        // 2. Prepare AI Prompt
        const messagesText = messages.map(m => `- ${m.content}`).join('\n')

        const systemPrompt = `You are a data analyst for a chatbot service.
        Analyze the following user queries sent to a chatbot.
        
        CONTEXT:
        ${contextInfo || 'No specific context provided.'}
        
        OUTPUT FORMAT (JSON ONLY):
        {
            "summary": "Brief summary of what users are asking about (max 3 sentences).",
            "topQuestions": ["Question 1", "Question 2", "Question 3" ... (up to 10)],
            "recommendations": {
                "prompt": "Suggested improvements for the system prompt to handle these queries better.",
                "missingData": ["List of specific information users asked for but might be missing"]
            }
        }
        
        Analyze these queries:
        ${messagesText}
        `

        // 3. Generate Analysis
        const analysisRaw = await generateChatResponse([{ role: 'user', content: 'Analyze this data.' }], systemPrompt)

        // 4. Parse JSON
        let analysisData
        try {
            // Cleanup markdown code blocks if AI adds them
            const cleanJson = analysisRaw.replace(/```json/g, '').replace(/```/g, '').trim()
            analysisData = JSON.parse(cleanJson)
        } catch (e) {
            console.error('JSON Parse Error', e)
            analysisData = {
                summary: "Erreur lors de l'analyse IA.",
                topQuestions: [],
                recommendations: { prompt: analysisRaw, missingData: [] } // Fallback
            }
        }

        return NextResponse.json(analysisData)

    } catch (error) {
        console.error('Stats Analysis Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
