const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
    console.log('--- Checking Chatbots Table ---');
    const { data: bots, error: botError } = await supabase.from('chatbots').select('*').limit(1);
    if (botError) {
        console.error('Error fetching chatbots:', botError);
    } else if (bots && bots.length > 0) {
        console.log('Columns in chatbots:', Object.keys(bots[0]));
    }

    console.log('\n--- Checking Leads Table ---');
    const { data: leads, error: leadError } = await supabase.from('leads').select('*').limit(1);
    if (leadError) {
        console.log('Leads table probably missing:', leadError.message);
    } else {
        console.log('Leads table EXISTS.');
    }
}

checkSchema();
