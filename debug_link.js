import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envRaw = fs.readFileSync('.env.local', 'utf8');
const getEnv = (key) => envRaw.match(new RegExp('^' + key + '=(.*)$','m'))?.[1].trim().replace('\r','');
const supabase = createClient(getEnv('VITE_SUPABASE_URL'), getEnv('VITE_SUPABASE_SECRETE_KEY'));

async function check() {
  const { data, error } = await supabase.from('payment_requests').select('id, budget_line_id');
  if (error) { console.error(error); return; }
  
  const nullCount = data.filter(r => r.budget_line_id === null).length;
  console.log(`Total DB Rows: ${data.length}`);
  console.log(`Rows with NULL budget_line_id: ${nullCount}`);
  
  if (nullCount > 0) {
    console.log('Sample NULL row:', data.find(r => r.budget_line_id === null));
  }
}
check();
