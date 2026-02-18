import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Admin client for storage operations
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(req) {
    try {
        const formData = await req.formData()
        const file = formData.get('file')

        if (!file) {
            return NextResponse.json({ error: 'File is required' }, { status: 400 })
        }

        // 1. Verify User Session
        const cookieStore = await cookies()

        // DEBUG: Log all cookies
        console.log('--- DEBUG COOKIES API ---')
        cookieStore.getAll().forEach(c => console.log(c.name, c.value.substring(0, 10) + '...'))

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            {
                cookies: {
                    get(name) { return cookieStore.get(name)?.value },
                },
            }
        )

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Prepare File
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        // 3. Upload to Supabase Storage 'logos' bucket using Admin
        const { error: uploadError } = await supabaseAdmin
            .storage
            .from('logos')
            .upload(filePath, file, {
                contentType: file.type,
                upsert: true
            })

        if (uploadError) {
            console.error('Upload error:', uploadError)
            return NextResponse.json({ error: 'Failed to upload to storage: ' + uploadError.message }, { status: 500 })
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
