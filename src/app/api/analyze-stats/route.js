import { NextResponse } from 'next/server'
import { generateChatResponse } from '@/lib/deepseek'

export async function POST(req) {
    try {
        const { messages, contextInfo } = await req.json()
        console.log('[API Analyze] Received messages count:', messages?.length)

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            console.warn('[API Analyze] No messages received or empty.')
            return NextResponse.json({
                summary: "Pas assez de données pour l'analyse. Essayez de discuter davantage avec votre chatbot.",
                topQuestions: [],
                recommendations: { prompt: "", missingData: [] }
            })
        }

        const apiKey = process.env.DEEPSEEK_API_KEY
        if (!apiKey) {
            console.error('[API Analyze] DEEPSEEK_API_KEY is missing.')
            return NextResponse.json({ error: 'Clé API DeepSeek manquante sur le serveur.' }, { status: 500 })
        }

        // 2. Prepare AI Prompt
        const messagesText = messages.map(m => `- ${m.content}`).join('\n')
        console.log('[API Analyze] Preparing prompt for AI...')

        const systemPrompt = `You are a data analyst for a chatbot service.
        Analyze the following user queries sent to a chatbot.
        
        IMPORTANT: Your entire response MUST be in FRENCH.
        
        CONTEXT:
        ${contextInfo || 'No specific context provided.'}
        
        OUTPUT FORMAT (JSON ONLY, NO MARKDOWN BLOCKS):
        {
            "summary": "Résumé bref de ce que les utilisateurs demandent (max 3 phrases).",
            "topQuestions": ["Question 1", "Question 2", "Question 3" ... (jusqu'à 10)],
            "recommendations": {
                "prompt": "Suggestions d'améliorations pour le prompt système afin de mieux répondre à ces requêtes.",
                "missingData": ["Liste des informations spécifiques que les utilisateurs ont demandées mais qui pourraient manquer"]
            }
        }
        
        Analyze these queries:
        ${messagesText}
        `

        // 3. Generate Analysis
        console.log('[API Analyze] Calling DeepSeek API...')
        let analysisRaw;
        try {
            analysisRaw = await generateChatResponse([{ role: 'user', content: 'Analyze high-level trends from these messages.' }], systemPrompt)
            console.log('[API Analyze] DeepSeek response received (first 100 chars):', analysisRaw?.substring(0, 100))
        } catch (aiErr) {
            console.error('[API Analyze] DeepSeek API CALL FAILED:', aiErr)
            return NextResponse.json({ error: 'L\'IA DeepSeek ne répond pas. Vérifiez vos crédits ou votre clé API.' }, { status: 503 })
        }

        if (!analysisRaw) {
            console.error('[API Analyze] Empty response from AI')
            return NextResponse.json({ error: 'Réponse vide de l\'IA.' }, { status: 500 })
        }

        // 4. Parse JSON
        let analysisData
        try {
            // Cleanup markdown code blocks if AI adds them
            const cleanJson = analysisRaw.replace(/```json/g, '').replace(/```/g, '').trim()
            analysisData = JSON.parse(cleanJson)
        } catch (e) {
            console.error('[API Analyze] JSON Parse Error:', e)
            console.log('[API Analyze] Raw response that failed parsing:', analysisRaw)
            analysisData = {
                summary: "L'IA a généré une réponse mais n'a pas pu la formater correctement.",
                topQuestions: [],
                recommendations: { prompt: analysisRaw, missingData: [] } // Fallback
            }
        }

        return NextResponse.json(analysisData)

    } catch (error) {
        console.error('[API Analyze] CRITICAL ERROR:', error)
        return NextResponse.json({ error: 'Erreur interne : ' + error.message }, { status: 500 })
    }
}
