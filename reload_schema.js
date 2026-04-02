import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envRaw = fs.readFileSync('.env.local', 'utf8');
const getEnv = (key) => envRaw.match(new RegExp('^' + key + '=(.*)$','m'))?.[1].trim().replace('\r','');
const supabase = createClient(getEnv('VITE_SUPABASE_URL'), getEnv('VITE_SUPABASE_SECRETE_KEY'));

async function reload() {
  const { data, error } = await supabase.rpc('run_sql', { sql: "NOTIFY pgrst, 'reload schema';" });
  if (error) {
      console.error('Error with run_sql:', error);
      // Try alternative
      const { error: e2 } = await supabase.from('payment_requests').select('*', { count: 'exact', head: true });
      console.log('Select Ping Result:', e2 ? 'FAIL' : 'OK (Schema might be auto-reloaded)');
  } else {
      console.log('RELOAD SUCCESSFUL via SQL NOTIFY.');
  }
}
reload();
