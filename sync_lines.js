import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { budgetLines } from './src/data/budgetData.js';

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

async function syncLines() {
  console.log(`Syncing ${budgetLines.length} budget lines to Supabase...`);
  
  // 1. Prepare data
  const payload = budgetLines.map(l => ({
    id: l.id,
    funding_source: l.fundingSource,
    strategic_pillar: l.strategicPillar,
    objective: l.objective,
    activity: l.activity,
    budget_code: l.budgetCode,
    odoo_code: l.odooCode,
    odoo_category: l.odooCategory,
    zgf_code: l.zgfCode,
    total_cost: l.totalCost,
    q1: l.q1,
    q2: l.q2,
    q3: l.q3,
    q4: l.q4,
    spent: 0, // Will be updated by requests next
    currency: 'ZMW'
  }));

  // 2. Upsert
  console.log(' - Upserting Budget Lines...');
  const { error: ie } = await supabase.from('budget_lines').upsert(payload, { onConflict: 'id' });
  if (ie) {
    console.error('Upsert Error:', ie);
    return;
  }
  console.log('✓ Budget Lines Synced.');

  // 3. Recalculate Spent from payment_requests
  console.log('Recalculating spend totals from payment_requests...');
  const { data: reqs, error: re } = await supabase
    .from('payment_requests')
    .select('budget_line_id, amount')
    .eq('status', 'Approved');

  if (!re && reqs) {
    const totals = {};
    reqs.forEach(r => totals[r.budget_line_id] = (totals[r.budget_line_id] || 0) + Number(r.amount));
    
    for (const [id, amt] of Object.entries(totals)) {
      await supabase.from('budget_lines').update({ spent: amt }).eq('id', id);
    }
    console.log('✓ Spent amounts updated for all lines.');
  }
}

syncLines();
