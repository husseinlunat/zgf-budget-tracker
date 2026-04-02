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

// Data from seed
import { samplePaymentRequests as data } from './src/data/budgetData.js';

function formatPostgresDate(d) {
  if (!d) return null;
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
  console.log(`Processing ${data.length} records...`);

  // Clear 2026
  await supabase.from('payment_requests').delete().eq('year', 2026);
  
  const errors = [];
  const successCount = 0;

  for (const r of data) {
    const payload = {
      id: r.id,
      name: r.name,
      amount: r.amount,
      status: r.status || 'Pending',
      budget_code: r.budgetCode || r.budget_code,
      budget_line_id: r.budgetLineId, // This might be null or invalid
      year: 2026,
      requested_by: r.requestedBy,
      funding_source: r.fundingSource,
      date: formatPostgresDate(r.date),
      synced_at: new Date().toISOString()
    };

    const { error } = await supabase.from('payment_requests').insert(payload);
    if (error) {
      errors.push({ id: r.id, error: error.message, detail: error.details });
    }
  }

  if (errors.length > 0) {
    console.error(`Failed to insert ${errors.length} records.`);
    console.log('Sample Error:', errors[0]);
    // Log all foreign key errors specifically
    const fkErrors = errors.filter(e => e.error.includes('foreign key'));
    if (fkErrors.length > 0) {
        console.log(`Found ${fkErrors.length} foreign key errors. This means some budget codes in the CSV don't match your Budget Lines.`);
    }
  } else {
    console.log('✓ Successfully inserted all records.');
  }

  // Final count
  const { count } = await supabase.from('payment_requests').select('*', { count: 'exact', head: true }).eq('year', 2026);
  process.stdout.write(`FINAL_COUNT:${count}\n`);
}

run();
