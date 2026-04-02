import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf-8')
    .split('\n')
    .filter(line => line.includes('='))
    .map(line => {
      const [k, ...v] = line.split('=');
      return [k.trim(), v.join('=').trim().replace('\r', '')];
    })
);

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_SECRETE_KEY);

async function test() {
    const payload = {
        id: 'TEST-123',
        name: 'Test Record',
        amount: 100,
        budget_code: '4.2',
        budget_line_id: 'CR-054', // A known good ID
        year: 2026,
        requested_by: 'Test User',
        date: '2026-01-01'
    };
    
    // Delete if exists
    await supabase.from('payment_requests').delete().eq('id', 'TEST-123');
    
    // Insert
    const { error } = await supabase.from('payment_requests').insert([payload]);
    if (error) console.error('INSERT ERR:', error);
    else console.log('Insert OK');
    
    // Check
    const { data } = await supabase.from('payment_requests').select('*').eq('id', 'TEST-123').single();
    console.log('Resulting row in DB:');
    console.log(data);
}
test();
