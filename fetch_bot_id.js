const { createClient } = require('@supabase/supabase-js');

// Config from .env.local
const SUPABASE_URL = 'https://dxfbuhmielkydrsbqyfg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4ZmJ1aG1pZWxreWRyc2JxeWZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwMjE0MDYsImV4cCI6MjA4NjU5NzQwNn0.PE0KcQdDzQ3DvB5si7DrMd4LBHQgUA_TYfDE0Tl3xQg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
    try {
        const { data, error } = await supabase
            .from('chatbots')
            .select('id, name')
            .limit(1)
            .single();

        if (error) {
            console.error('Error fetching chatbot:', error);
        } else {
            console.log('CHATBOT_ID=' + data.id);
            console.log('CHATBOT_NAME=' + data.name);
        }
    } catch (err) {
        console.error('Exception:', err);
    }
}

main();
