import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envRaw = fs.readFileSync('.env.local', 'utf8');
const getEnv = (key) => envRaw.match(new RegExp('^' + key + '=(.*)$','m'))?.[1].trim().replace('\r','');
const supabase = createClient(getEnv('VITE_SUPABASE_URL'), getEnv('VITE_SUPABASE_SECRETE_KEY'));

async function check() {
    const { data, error } = await supabase.from('payment_requests').select('id, budget_line_id');
    if (error) { console.error(error); return; }
    
    const total = data.length;
    const linked = data.filter(r => r.budget_line_id).length;
    const unlinked = total - linked;
    
    console.log(`--- Linkage Stats ---`);
    console.log(`TOTAL RECORDS: ${total}`);
    console.log(`LINKED TO BUDGET: ${linked} (${((linked/total)*100).toFixed(1)}%)`);
    console.log(`UNLINKED: ${unlinked} (${((unlinked/total)*100).toFixed(1)}%)`);
    
    if (unlinked > 0) {
        console.log(`\nSample Unlinked IDs:`, data.filter(r => !r.budget_line_id).slice(0, 5).map(r => r.id));
    }
}
check();
