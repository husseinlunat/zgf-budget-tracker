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

async function run() {
    console.log('--- THE ULTIMATE SYNC: ATOMISTIC REFRESH ---');

    console.log('1. TRUNCATING ALL TABLES...');
    // We do it in order to avoid FK errors
    await supabase.from('deductions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('payment_requests').delete().neq('id', 'NONE');
    await supabase.from('budget_lines').delete().neq('id', 'NONE');

    console.log('2. INSERTING BUDGET LINES...');
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
    
    // Insert lines one by one to ensure no silent global failure
    for (const line of linePayload) {
        const { error } = await supabase.from('budget_lines').insert([line]);
        if (error) console.error(`   FAIL Line ${line.id}: ${error.message}`);
    }
    console.log('✓ Budget Lines Inserted.');

    const { data: dbLinesCheck } = await supabase.from('budget_lines').select('id');
    const validIds = new Set(dbLinesCheck.map(l => l.id));
    console.log(`Live Budget Lines in DB: ${validIds.size}`);

    console.log('3. INSERTING PAYMENT REQUESTS...');
    const csvContent = fs.readFileSync('approved_requests_2026_updated.csv', 'utf8').trim();
    const rows = csvContent.split('\n').filter(line => line.trim());
    
    for (let i = 1; i < rows.length; i++) {
        const regex = /(".*?"|[^",\s][^",]*[^",\s]|[^",\s]|(?<=,|^)(?=,|$))/g;
        const p = rows[i].match(regex).map(part => part.replace(/^"|"$/g, '').trim());
        if (p.length < 9) continue;

        const input = { budget_code: p[3], name: p[1], funding_source: p[4] };
        const bId = findBudgetLineId(input);

        const pr = {
            id: `PR-${p[0]}`,
            name: p[1],
            amount: parseAmount(p[5]),
            status: p[7] || 'Approved',
            budget_code: p[3],
            budget_line_id: validIds.has(bId) ? bId : null,
            year: 2026,
            requested_by: p[2],
            funding_source: p[4],
            date: '2026-01-01',
            synced_at: new Date().toISOString()
        };
        
        const { error } = await supabase.from('payment_requests').insert([pr]);
        if (error) console.error(`   FAIL PR ${pr.id}: ${error.message}`);
    }

    console.log('--- ULTIMATE SYNC FINISHED ---');
}

run().catch(console.error);
