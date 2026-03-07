import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import * as cheerio from 'cheerio'
import { generateChatResponse } from '@/lib/deepseek'

export const dynamic = 'force-dynamic'

async function scrapePage(url, domain) {
    try {
        // Try the specialized reader service first for better quality/JS support
        const readerUrl = `https://r.jina.ai/${url}`
        const res = await fetch(readerUrl, {
            headers: {
                'X-Return-Format': 'text'
            },
            signal: AbortSignal.timeout(15000)
        })

        if (res.ok) {
            const text = await res.text()
            if (text.length > 200) { // Enough text to be valid
                return { text, links: [] } // Jina doesn't return easy links this way, but quality is better
            }
        }

        // Fallback to manual cheerio scraping
        const directRes = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            signal: AbortSignal.timeout(10000)
        })

        if (!directRes.ok) return { text: '', links: [] }

        const html = await directRes.text()
        const $ = cheerio.load(html)

        // Remove noise (keep header for now as it often has the main pitch)
        $('script, style, nav, footer, iframe, noscript').remove()

        // Extract text
        const textParts = []
        $('h1, h2, h3, h4, h5, h6, p, li, td, span, main, section, article').each((i, el) => {
            const content = $(el).text().trim()
            if (content.length > 10) { // Slightly more lenient
                textParts.push(content)
            }
        })

        const cleanedText = Array.from(new Set(textParts)).join('\n\n')

        // Extract links from same domain
        const links = []
        $('a').each((i, el) => {
            let href = $(el).attr('href')
            if (!href) return

            try {
                const absoluteUrl = new URL(href, url).href
                const urlObj = new URL(absoluteUrl)
                if (urlObj.hostname === domain && !absoluteUrl.includes('#') && !absoluteUrl.match(/\.(jpg|png|gif|pdf|zip|docx)$/i)) {
                    links.push(absoluteUrl)
                }
            } catch (e) { }
        })

        return { text: cleanedText, links: Array.from(new Set(links)) }
    } catch (error) {
        console.error(`Error scraping ${url}:`, error)
        return { text: '', links: [] }
    }
}

export async function POST(req) {
    try {
        const { url } = await req.json()

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 })
        }

        const targetUrl = url.startsWith('http') ? url : `https://${url}`
        const urlObj = new URL(targetUrl)
        const domain = urlObj.hostname

        // 1. Verify User Session & Plan (Privacy/Protection)
        const cookieStore = await cookies()
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        )

        // Standard way to get user in App Router API
        let { data: { user }, error: authError } = await supabase.auth.getUser(
            cookieStore.get('sb-dxfbuhmielkydrsbqyfg-auth-token')?.value?.split('"')[1] ||
            cookieStore.get('supabase-auth-token')?.value
        )

        // If the above fails, try the generic session check
        if (!user) {
            const { data: { session } } = await supabase.auth.getSession()
            user = session?.user
        }

        // 1.5 For Localhost development, we can be more lenient to allow the user to test
        const isLocalhost = req.headers.get('host')?.includes('localhost') || req.headers.get('host')?.includes('127.0.0.1')

        if (!user && !isLocalhost) {
            console.log('No user found in scrape API')
            return NextResponse.json({ error: 'Unauthorized - Please refresh and try again' }, { status: 401 })
        }

        // Skip profile plan check on localhost for testing purposes
        if (!isLocalhost && user) {
            const { data: profile } = await supabase.from('profiles').select('plan_tier').eq('id', user.id).single()
            const planTier = profile?.plan_tier || 'free'

            if (planTier === 'free') {
                return NextResponse.json({ error: 'The website scraping feature is reserved for Pro and Agency plans.' }, { status: 403 })
            }
        }

        // 2. Start Scraping (Max 10 pages for speed)
        let visited = new Set()
        let queue = [targetUrl]
        let totalText = ""
        let pageCount = 0
        const maxPages = 10

        while (queue.length > 0 && pageCount < maxPages) {
            const currentUrl = queue.shift()
            if (visited.has(currentUrl)) continue

            visited.add(currentUrl)
            const { text, links } = await scrapePage(currentUrl, domain)

            if (text) {
                totalText += `--- Contenu de ${currentUrl} ---\n${text}\n\n`
                pageCount++
            }

            // Add new links to queue
            for (const link of links) {
                if (!visited.has(link) && !queue.includes(link)) {
                    queue.push(link)
                }
            }
        }

        if (!totalText) {
            return NextResponse.json({ error: 'No content could be extracted from this site. Verify the URL.' }, { status: 400 })
        }

        // 3. AI Cleaning & Translation (The "IA Understand" Part)
        // Increase limits for higher quality and completeness
        const textPayload = totalText.substring(0, 25000)

        const aiPrompt = `Voici le contenu brut extrait d'un site web (domain: ${domain}). Ta mission est de nettoyer ce texte : supprime les répétitions (comme les politiques de cookies, les footers répétés, les menus), les mentions inutiles et tout ce qui ne sert pas à la connaissance du chatbot. 
TRADUCTION : Si le texte est dans une autre langue, traduis-le ENTIÈREMENT EN FRANÇAIS. 
STRUCTURE : Organise le résultat en sections claires (Produits/Services, Tarifs, À propos, Support, Témoignages). Le contenu final sera utilisé comme BASE DE CONNAISSANCES pour un chatbot commercial Vendo. Garde les informations importantes (prix, fonctionnalités, témoignages) de manière précise et complète.`

        const cleanedAIKnowledge = await generateChatResponse(
            [{ role: 'user', content: aiPrompt + "\n\nCONTENU À TRAITER :\n" + textPayload }],
            "Tu es un expert en traitement de données pour chatbot. Ton but est de fournir une base de connaissances en français, claire, directe et sans superflu. Fournis une réponse complète même si le texte est long.",
            4000 // Increased max tokens to avoid truncation
        )

        return NextResponse.json({
            data_sources: cleanedAIKnowledge,
            page_count: pageCount,
            original_size: totalText.length
        })

    } catch (error) {
        console.error('Server side scraping error:', error)
        return NextResponse.json({ error: 'Internal server error during scraping' }, { status: 500 })
    }
}
