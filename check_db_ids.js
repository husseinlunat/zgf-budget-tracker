import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envRaw = fs.readFileSync('.env.local', 'utf8');
const getEnv = (key) => envRaw.match(new RegExp('^' + key + '=(.*)$','m'))?.[1].trim().replace('\r','');
const supabase = createClient(getEnv('VITE_SUPABASE_URL'), getEnv('VITE_SUPABASE_SECRETE_KEY'));

async function check() {
  const { data, error } = await supabase.from('budget_lines').select('id');
  if (error) { console.error(error); return; }
  console.log('Total DB Budget Lines:', data.length);
  console.log('Sample IDs (First 10):', data.slice(0, 10).map(l => `'${l.id}'`));
  
  const idToFind = 'CR-054';
  const found = data.find(l => l.id.trim() === idToFind);
  console.log(`Searching for '${idToFind}':`, found ? 'FOUND' : 'NOT FOUND');
  if (found && found.id !== idToFind) {
      console.log(`MISMATCH: DB has '${found.id}' but searching for '${idToFind}'`);
  }
}
check();
