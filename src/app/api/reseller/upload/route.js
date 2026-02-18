import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Use service role to bypass RLS
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(req) {
    try {
        const formData = await req.formData()
        const file = formData.get('file')
        const token = formData.get('token')

        if (!file || !token) {
            return NextResponse.json({ error: 'File and token are required' }, { status: 400 })
        }

        // 1. Validate Token (Security)
        const { data: chatbot, error: tokenError } = await supabaseAdmin
            .from('chatbots')
            .select('id')
            .eq('reseller_token', token)
            .single()

        if (tokenError || !chatbot) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
        }

        // 2. Prepare File
        const fileExt = file.name.split('.').pop()
        const fileName = `${chatbot.id}-${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        // 3. Upload to Supabase Storage 'logos' bucket
        const { error: uploadError } = await supabaseAdmin
            .storage
            .from('logos')
            .upload(filePath, file, {
                contentType: file.type,
                upsert: true
            })

        if (uploadError) {
            console.error('Upload error:', uploadError)
            return NextResponse.json({ error: 'Failed to upload to storage' }, { status: 500 })
        }

        // 4. Get Public URL
        const { data: { publicUrl } } = supabaseAdmin
            .storage
            .from('logos')
            .getPublicUrl(filePath)

        return NextResponse.json({ url: publicUrl })

    } catch (error) {
        console.error('Server upload error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
