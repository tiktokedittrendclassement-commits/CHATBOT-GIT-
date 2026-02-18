const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function getToken() {
    const { data, error } = await supabase
        .from('chatbots')
        .select('reseller_token')
        .limit(1)
        .single()

    if (error) {
        console.error('Error fetching token:', error.message)
        process.exit(1)
    }

    console.log('TOKEN:' + data.reseller_token)
}

getToken()
