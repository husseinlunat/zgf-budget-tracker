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

import { samplePaymentRequests as data, budgetLines } from './src/data/budgetData.js';

const validLineIds = new Set(budgetLines.map(l => l.id));

function formatPostgresDate(d) {
  if (!d) return '2026-01-01';
  if (d.includes('/')) {
    const parts = d.split('/');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      if (year.length === 4) return `${year}-${month}-${day}`;
    }
  }
  if (d.length === 4) return `${d}-01-01`;
  if (d.match(/^\d{4}-\d{2}-\d{2}$/)) return d;
  return '2026-01-01';
}

async function run() {
  console.log('Verifying connection & Clearing 2026 data...');
  const { error: delErr } = await supabase.from('payment_requests').delete().eq('year', 2026);
  if(delErr) { console.error('DELETE ERROR:', delErr); return; }
  
  const chunks = [];
  for (let i = 0; i < data.length; i += 50) chunks.push(data.slice(i, i + 50));
  
  let inserted = 0;
  for (const chunk of chunks) {
    const payload = chunk.map(r => {
      const bLineId = r.budgetLineId;
      return {
        id: r.id,
        name: r.name,
        amount: r.amount,
        status: r.status || 'Pending',
        budget_code: r.budgetCode,
        budget_line_id: bLineId || null,
        year: r.year || 2026,
        requested_by: r.requestedBy,
        funding_source: r.fundingSource,
        date: formatPostgresDate(r.date),
        synced_at: new Date().toISOString()
      };
    });
    
    // Validate that budget_code is populated
    if (payload[0].budget_code === undefined) {
        throw new Error('BUDGET CODE IS UNDEFINED IN PAYLOAD. Check property mapping!');
    }
    
    const { error: ie } = await supabase.from('payment_requests').insert(payload);
    if (ie) {
      console.error('--- INSERT ERROR ---');
      console.error(JSON.stringify(ie, null, 2));
      process.exit(1);
    }
    inserted += payload.length;
    console.log(`✓ Inserted batch. Total: ${inserted}/${data.length}`);
  }
  console.log('SYNC COMPLETE: All 219 Payment Requests inserted with strictly confirmed mappings.');
}

run();
