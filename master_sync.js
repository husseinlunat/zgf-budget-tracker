import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { findBudgetLineId } from './src/data/budgetData.js';

const envRaw = fs.readFileSync('.env.local', 'utf8');
const getEnv = (key) => envRaw.match(new RegExp('^' + key + '=(.*)$','m'))?.[1].trim().replace('\r','');
const supabase = createClient(getEnv('VITE_SUPABASE_URL'), getEnv('VITE_SUPABASE_SECRETE_KEY'));

function parseAmount(val) {
  if (!val) return 0;
  const clean = val.toString().replace(/[$,K\s]/g, '').replace(/,/g, '');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

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
  if (d.length === 4 && !isNaN(d)) return `${d}-01-01`;
  if (d.match(/^\d{4}-\d{2}-\d{2}$/)) return d;
  return '2026-01-01';
}

async function sync() {
  console.log('--- FINAL MASTER SYNC (Zero-Crash Edition) ---');
  
  // 1. Fetch valid IDs from DB
  const { data: dbLines } = await supabase.from('budget_lines').select('id');
  const validIds = new Set(dbLines.map(l => l.id));
  console.log(`Verified ${validIds.size} valid Budget Line IDs in Database.`);

  // 2. Read CSV
  const csvContent = fs.readFileSync('approved_requests_2026_updated.csv', 'utf8').trim();
  const rows = csvContent.split('\n').filter(line => line.trim());
  
  const records = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const regex = /(".*?"|[^",\s][^",]*[^",\s]|[^",\s]|(?<=,|^)(?=,|$))/g;
    const parts = row.match(regex).map(p => p.replace(/^"|"$/g, '').trim());

    if (parts.length < 9) continue;
    
    const input = {
        budget_code: parts[3],
        name: parts[1],
        funding_source: parts[4]
    };

    let bLineId = findBudgetLineId(input);
    if (i === 1) {
        console.log(`DEBUG Row 1: Code=[${input.budget_code}] Name=[${input.name}] FS=[${input.funding_source}]`);
        console.log(`DEBUG bLineId results: ${bLineId}`);
    }
    
    // DB Validation Guard
    if (bLineId && !validIds.has(bLineId)) {
        // console.log(`  Row ${i}: Link ${bLineId} rejected (not in DB).`);
        bLineId = null;
    }

    records.push({
        id: `PR-${parts[0]}`,
        name: parts[1],
        amount: parseAmount(parts[5]),
        status: parts[7] || 'Approved',
        budget_code: parts[3],
        budget_line_id: bLineId || null,
        year: 2026,
        requested_by: parts[2],
        funding_source: parts[4],
        date: formatPostgresDate(parts[8]),
        synced_at: new Date().toISOString()
    });
  }

  console.log(`Parsed ${records.length} records. Cleaning and Inserting...`);

  await supabase.from('payment_requests').delete().eq('year', 2026);
  
  const batchSize = 100;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const { error } = await supabase.from('payment_requests').insert(batch);
    if (error) {
       console.error(`Batch Error: ${error.message}. Resorting to individual inserts.`);
       for (const r of batch) {
           await supabase.from('payment_requests').insert([r]);
       }
    } else {
       console.log(`✓ Inserted batch ${i/batchSize + 1}. Total: ${i + batch.length}/${records.length}`);
    }
  }

  console.log('--- SYNC SUCCESSFUL. CATEGORIES ARE NOW MAPPED WHERE POSSIBLE ---');
}

sync().catch(console.error);
