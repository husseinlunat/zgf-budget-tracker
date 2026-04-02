import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envRaw = fs.readFileSync('.env.local', 'utf8');
const getEnv = (key) => envRaw.match(new RegExp('^' + key + '=(.*)$','m'))?.[1].trim().replace('\r','');
const supabase = createClient(getEnv('VITE_SUPABASE_URL'), getEnv('VITE_SUPABASE_SECRETE_KEY'));

async function check() {
    console.log('--- RAW DATABASE SPENT AUDIT ---');
    const { data, error } = await supabase.from('budget_lines').select('id, activity, spent').limit(10);
    if (error) { console.error(error); return; }
    
    data.forEach(l => {
        console.log(`ID: ${l.id.padEnd(8)} | Spent: ${String(l.spent).padStart(10)} | Activity: ${l.activity.substring(0, 40)}...`);
    });
    
    const { data: totalData } = await supabase.from('budget_lines').select('spent');
    const total = (totalData || []).reduce((s, l) => s + Number(l.spent), 0);
    console.log(`\nTOTAL SYSTEM SPENT: ZMW ${total.toFixed(2)}`);
}
check();
