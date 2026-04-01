import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env.local
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

// Use pre-mapped data from budgetData
import { samplePaymentRequests as data } from './src/data/budgetData.js';

function formatPostgresDate(d) {
  if (!d) return null;
  // Convert DD/MM/YYYY to YYYY-MM-DD if needed
  if (d.includes('/')) {
    const parts = d.split('/');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
  }
  return d;
}

async function run() {
  console.log('Verifying connection...');
  const { status, error: ve } = await supabase.from('payment_requests').select('*', { count: 'exact', head: true });
  if (ve) {
    console.error('Connection Error:', ve);
    return;
  }
  console.log('Target Accessible. Clearing 2026 data...');
  
  await supabase.from('payment_requests').delete().eq('year', 2026);
  
  const chunks = [];
  for (let i = 0; i < data.length; i += 50) chunks.push(data.slice(i, i + 50));
  
  for (const chunk of chunks) {
    const payload = chunk.map(r => ({
      id: r.id,
      name: r.name,
      amount: r.amount,
      status: r.status || 'Pending',
      budget_code: r.budget_code,
      budget_line_id: r.budgetLineId,
      year: r.year || 2026,
      requested_by: r.requested_by,
      funding_source: r.funding_source,
      date: formatPostgresDate(r.date),
      synced_at: new Date().toISOString()
    }));
    const { error: ie } = await supabase.from('payment_requests').insert(payload);
    if (ie) {
      console.error('Insert Error:', JSON.stringify(ie, null, 2));
      break;
    }
    console.log(`Inserted ${payload.length} records...`);
  }
  
  console.log('Sync Complete.');
}

run();
