import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual parsing of .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1].trim() : null;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_SECRETE_KEY'); // Service role key

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    console.log('Checking tables in Supabase...');
    // We can try to query a system table or just try to select from common names
    const { data, error } = await supabase
        .from('payment_requests') // Try again but with more detail
        .select('id')
        .limit(1);

    if (error) {
        console.error('Error fetching from payment_requests:', error.message);
        console.log('Trying plural/singular variations...');
        
        const { data: data2, error: error2 } = await supabase.from('payment_request').select('id').limit(1);
        if (error2) console.error('Error fetching from payment_request:', error2.message);
        else console.log('Found table: payment_request');

        const { data: data3, error: error3 } = await supabase.from('requests').select('id').limit(1);
        if (error3) console.error('Error fetching from requests:', error3.message);
        else console.log('Found table: requests');
    } else {
        console.log('Found table: payment_requests');
        console.log('Proceeding to clear...');
        const { error: delError } = await supabase.from('payment_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (delError) console.error('Delete error:', delError.message);
        else console.log('Successfully cleared payment_requests.');
    }
}

checkTables();
