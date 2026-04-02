import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual parsing of .env.local since we might not have dotenv installed for this script context
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1].trim() : null;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_SECRETE_KEY'); // Service role key with typo from .env.local

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase configuration in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearPaymentRequests() {
    console.log('Clearing payment_requests table...');
    
    // Deleting all rows (caution: this is destructive)
    const { data, error } = await supabase
        .from('payment_requests')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Dummy condition to allow unqualified delete if needed, or just .select() first

    if (error) {
        console.error('Error clearing table:', error.message);
    } else {
        console.log('Successfully cleared all payment requests from Supabase.');
    }
}

clearPaymentRequests();
