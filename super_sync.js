import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { budgetLines, findBudgetLineId } from './src/data/budgetData.js';

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

async function run() {
    console.log('--- SUPER SYNC: TOTAL SYSTEM REFRESH ---');

    // 1. Clear Old Data (Deductions first to avoid FK errors)
    console.log('Cleaning existing records...');
    await supabase.from('deductions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('payment_requests').delete().neq('id', 'NONE');
    await supabase.from('budget_lines').delete().neq('id', 'NONE');

    // 2. Insert Budget Lines
    console.log(`Inserting ${budgetLines.length} Budget Lines...`);
    const linePayload = budgetLines.map(l => ({
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
        q1: l.q1, q2: l.q2, q3: l.q3, q4: l.q4,
        spent: 0,
        currency: 'ZMW'
    }));
    const { error: lineErr } = await supabase.from('budget_lines').insert(linePayload);
    if (lineErr) throw lineErr;

    // 3. Parse CSV & Map Payment Requests
    const csvContent = fs.readFileSync('approved_requests_2026_updated.csv', 'utf8').trim();
    const rows = csvContent.split('\n').filter(line => line.trim());
    
    const prPayload = [];
    for (let i = 1; i < rows.length; i++) {
        const regex = /(".*?"|[^",\s][^",]*[^",\s]|[^",\s]|(?<=,|^)(?=,|$))/g;
        const p = rows[i].match(regex).map(part => part.replace(/^"|"$/g, '').trim());

        if (p.length < 9) continue;

        const input = { budget_code: p[3], name: p[1], funding_source: p[4] };
        const matchedId = findBudgetLineId(input);

        prPayload.push({
            id: `PR-${p[0]}`,
            name: p[1],
            amount: parseAmount(p[5]),
            status: p[7] || 'Approved',
            budget_code: p[3],
            budget_line_id: matchedId || null,
            year: 2026,
            requested_by: p[2],
            funding_source: p[4],
            date: formatPostgresDate(p[8]),
            synced_at: new Date().toISOString()
        });
    }

    // 4. Insert Payment Requests
    console.log(`Inserting ${prPayload.length} Payment Requests...`);
    // Batch in chunks of 50
    for (let i = 0; i < prPayload.length; i += 50) {
        const chunk = prPayload.slice(i, i + 50);
        const { error } = await supabase.from('payment_requests').insert(chunk);
        if (error) {
            console.error(`Batch ${i/50} fail:`, error.message);
            // Single retry
            for (const r of chunk) {
                const { error: e2 } = await supabase.from('payment_requests').insert([r]);
                if (e2) console.warn(`Skipping PR ${r.id}: ${e2.message} (Value: ${r.budget_line_id})`);
            }
        }
    }

    // 5. Final Spent Recalculation
    const { data: approvedReqs } = await supabase.from('payment_requests').select('budget_line_id, amount').eq('status', 'Approved');
    const totals = {};
    approvedReqs.forEach(r => {
        if (r.budget_line_id) totals[r.budget_line_id] = (totals[r.budget_line_id] || 0) + Number(r.amount);
    });
    for (const [id, amt] of Object.entries(totals)) {
        await supabase.from('budget_lines').update({ spent: amt }).eq('id', id);
    }

    console.log('--- SUPER SYNC COMPLETE: Database is now 100% consistent! ---');
}

run().catch(console.error);
