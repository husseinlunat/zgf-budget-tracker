import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envRaw = fs.readFileSync('.env.local', 'utf8');
const getEnv = (key) => envRaw.match(new RegExp('^' + key + '=(.*)$','m'))?.[1].trim().replace('\r','');
const supabase = createClient(getEnv('VITE_SUPABASE_URL'), getEnv('VITE_SUPABASE_SECRETE_KEY'));

async function definitiveCalibration() {
    console.log('--- DEFINITIVE ANALYTICS CALIBRATION (ATOMIC) ---');

    // 1. Wipe everything to ensure a clean state
    console.log('Wiping stale data...');
    await supabase.from('payment_requests').delete().neq('id', 'NONE');
    await supabase.from('budget_lines').delete().neq('id', 'NONE');

    // Wait 5 seconds for the database to commit the wipe
    console.log('Waiting for database to sync...');
    await new Promise(r => setTimeout(r, 5000));

    // 2. Load the 98 Master Lines (Import logic handles the data structure)
    const { budgetLines } = await import('./src/data/budgetData.js');
    console.log(`Pushing ${budgetLines.length} Master Budget Lines...`);
    const blPayload = budgetLines.map(l => ({
        id: l.id, funding_source: l.fundingSource, strategic_pillar: l.strategicPillar,
        objective: l.objective, activity: l.activity, budget_code: l.budgetCode,
        odoo_code: l.odooCode, odoo_category: l.odooCategory, zgf_code: l.zgfCode,
        total_cost: l.totalCost, q1: l.q1, q2: l.q2, q3: l.q3, q4: l.q4,
        spent: 0, currency: 'ZMW'
    }));
    
    // UPSERT ALL LINES to ensure they exist for the foreign key
    const { error: blErr } = await supabase.from('budget_lines').upsert(blPayload, { onConflict: 'id' });
    if (blErr) throw new Error(`Budget Line Upsert Fail: ${blErr.message}`);
    console.log('✓ Master Lines Populated.');

    // Wait another 3 seconds for the lines to be indexing
    await new Promise(r => setTimeout(r, 3000));

    // 3. Process 219 Payment Requests with Robust Parser
    console.log('Parsing 219 Payment Requests from CSV...');
    const csv = fs.readFileSync('approved_requests_2026_updated.csv', 'utf8').trim();
    const rows = csv.split('\n').filter(l => l.trim()).slice(1);
    const prs = [];
    let processedValue = 0;

    for (const row of rows) {
        // Robust CSV row parser for quoted commas (K 31,776 case)
        const parts = []; let cur = ''; let q = false;
        for (const c of [...row]) {
            if (c === '"') q = !q; else if (c === ',' && !q) { parts.push(cur.trim()); cur = ''; }
            else cur += c;
        }
        parts.push(cur.trim());
        const p = parts.map(x => x.replace(/^"|"$/g, '').trim());
        if (p.length < 9) continue;

        const rawAmt = p[5] || '0';
        const amt = parseFloat(rawAmt.replace(/[^0-9.]/g, '')) || 0;
        const bCode = p[3];
        const rawFS = p[4] || '';
        const name = p[1] || '';

        // Mapping Logic
        let bId = null;
        let fs = rawFS.toLowerCase();
        if (fs.includes('kalulu')) fs = 'kaluluii';
        if (fs.includes('mott')) fs = 'mottiii';

        const match = budgetLines.find(bl => (bl.budgetCode === bCode || bl.zgfCode === bCode) && bl.fundingSource.toLowerCase().includes(fs.substring(0,4)));
        if (match) bId = match.id;
        else {
            // Precise fallbacks for mapping failures
            if (bCode === '5.3.1' || name.toLowerCase().includes('staff') || name.toLowerCase().includes('salary')) {
                if (fs === 'zgf') bId = 'ZGF-005';
                else if (fs === 'kaluluii') bId = 'KL-041';
                else if (fs === 'mottiii') bId = 'MT-030';
                else bId = 'CR-053';
            } else if (name.toLowerCase().includes('health talk')) {
                bId = 'CR-050';
            } else if (bCode === '1.1.1' || bCode === '4000-010-004') {
                bId = 'CR-001';
            } else if (fs.includes('comic')) {
                bId = 'CR-055';
            } else {
                bId = budgetLines.find(bl => bl.fundingSource.toLowerCase().includes(fs.substring(0,4)))?.id || 'CR-053';
            }
        }

        prs.push({
            id: `PR-${p[0]}`, name: p[1], amount: amt, status: 'Approved',
            budget_line_id: bId, year: 2026, requested_by: p[2],
            funding_source: p[4], date: '2026-01-01'
        });
        processedValue += amt;
    }

    console.log(`Inserting 219 Payment Requests (Processing K ${processedValue.toLocaleString()})...`);
    // Insert PRs in batches to avoid network issues
    for (let i = 0; i < prs.length; i += 25) {
        const batch = prs.slice(i, i + 25);
        const { error } = await supabase.from('payment_requests').insert(batch);
        if (error) throw new Error(`PR Insert Fail: ${error.message} (Record index ${i})`);
    }

    // 4. Spent Aggregation Step
    console.log('Recalculating Budget Line spent totals...');
    const totalsMap = {};
    prs.forEach(pr => {
        if (pr.budget_line_id) totalsMap[pr.budget_line_id] = (totalsMap[pr.budget_line_id] || 0) + pr.amount;
    });

    let updatedCount = 0;
    for (const [id, totalAmt] of Object.entries(totalsMap)) {
        const { error } = await supabase.from('budget_lines').update({ spent: totalAmt }).eq('id', id);
        if (!error) updatedCount++;
    }

    console.log(`--- CALIBRATION FINISHED: ${updatedCount} Budget lines updated. ---`);
    console.log(`--- TOTAL DASHBOARD SPENT: K ${processedValue.toLocaleString()} ---`);
}

definitiveCalibration().catch(e => {
    console.error('CRITICAL CALIBRATION ERROR:', e.message);
    process.exit(1);
});
