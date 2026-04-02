import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envRaw = fs.readFileSync('.env.local', 'utf8');
const getEnv = (key) => envRaw.match(new RegExp('^' + key + '=(.*)$','m'))?.[1].trim().replace('\r','');
const supabase = createClient(getEnv('VITE_SUPABASE_URL'), getEnv('VITE_SUPABASE_SECRETE_KEY'));

async function recovery() {
    console.log('--- ABSOLUTE FINAL RECOVERY (UPSERT) ---');

    // 1. Restore Budget Lines First (Seed Data)
    const { budgetLines } = await import('./src/data/budgetData.js');
    console.log('Upserting 98 Budget Lines...');
    const blPayload = budgetLines.map(l => ({
        id: l.id, funding_source: l.fundingSource, strategic_pillar: l.strategicPillar,
        objective: l.objective, activity: l.activity, budget_code: l.budgetCode,
        odoo_code: l.odooCode, odoo_category: l.odooCategory, zgf_code: l.zgfCode,
        total_cost: l.totalCost, q1: l.q1, q2: l.q2, q3: l.q3, q4: l.q4,
        spent: 0, currency: 'ZMW'
    }));
    await supabase.from('budget_lines').upsert(blPayload);

    // 2. Parse and Upsert PRs
    const csv = fs.readFileSync('approved_requests_2026_updated.csv', 'utf8').trim();
    const rows = csv.split('\n').filter(l => l.trim()).slice(1);
    
    const prs = [];
    rows.forEach(row => {
        const parts = []; let cur = ''; let q = false;
        for (const c of [...row]) {
            if (c === '"') q = !q;
            else if (c === ',' && !q) { parts.push(cur.trim()); cur = ''; }
            else cur += c;
        }
        parts.push(cur.trim());
        const p = parts.map(x => x.replace(/^"|"$/g, '').trim());
        if (p.length < 9) return;

        const amt = parseFloat(p[5].replace(/[^0-9.]/g, '')) || 0;
        // Simple mapping based on index or code
        const bCode = p[3];
        const bId = budgetLines.find(bl => bl.budgetCode === bCode || bl.zgfCode === bCode)?.id || 'CR-053';

        prs.push({
            id: `PR-${p[0]}`, name: p[1], amount: amt, status: 'Approved',
            budget_line_id: bId, year: 2026, requested_by: p[2],
            funding_source: p[4], date: '2026-01-01'
        });
    });

    console.log(`Upserting ${prs.length} Payment Requests...`);
    await supabase.from('payment_requests').upsert(prs);

    // 3. Recalculate Spent
    console.log('Calculating spent totals...');
    const totals = {};
    prs.forEach(pr => {
        if (pr.budget_line_id) totals[pr.budget_line_id] = (totals[pr.budget_line_id] || 0) + pr.amount;
    });

    for (const [id, amt] of Object.entries(totals)) {
        await supabase.from('budget_lines').update({ spent: amt }).eq('id', id);
    }

    console.log('✓ RECOVERY ATTEMPT FINISHED. Please check the dashboard.');
}

recovery().catch(console.error);
