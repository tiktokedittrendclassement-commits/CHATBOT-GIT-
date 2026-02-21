
import OpenAI from 'openai'

export async function generateChatResponse(messages, systemPrompt = 'You are a helpful assistant.') {
    // Instantiate inside the function so it only runs at request time (not build time)
    const deepseek = new OpenAI({
        baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
        apiKey: process.env.DEEPSEEK_API_KEY || '',
    })

    try {
        const fullMessages = [
            { role: 'system', content: systemPrompt },
            ...messages
        ]

        const completion = await deepseek.chat.completions.create({
            messages: fullMessages,
            model: 'deepseek-chat',
            temperature: 0.7,
            max_tokens: 1000,
        })

        return completion.choices[0].message.content
    } catch (error) {
        console.error('DeepSeek API Error:', error)
        throw new Error('Failed to generate response from AI.')
    }
}
