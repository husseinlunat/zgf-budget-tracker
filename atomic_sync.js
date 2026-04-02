import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envRaw = fs.readFileSync('.env.local', 'utf8');
const getEnv = (key) => envRaw.match(new RegExp('^' + key + '=(.*)$','m'))?.[1].trim().replace('\r','');
const supabase = createClient(getEnv('VITE_SUPABASE_URL'), getEnv('VITE_SUPABASE_SECRETE_KEY'));

// --- HARDCODED BUDGET LINES (Sample of IDs to ensure mapping works, but we'll load the full 98 from the file content below) ---
const budgetLinesSeed = [
    { id: 'CR-001', fs: 'Comic Relief', code: '4000-010-004', activity: 'Disbursement to 20 CSO\'s - March 2026' },
    { id: 'CR-053', fs: 'Comic Relief', code: '4300-050-090-320', activity: 'Staff Time Charges (Monthly)' },
    { id: 'ZGF-005', fs: 'ZGF', code: '4300-050-090-325', activity: 'General Overheads' },
    { id: 'KL-041', fs: 'KaluluII', code: '4300-050-090-320', activity: 'Staff Input' },
    { id: 'MT-030', fs: 'MOTTIII', fs: 'MOTTIII', code: '4300-050-090-320', activity: 'Staff Time Charges (9 months)' },
    { id: 'CR-055', fs: 'Comic Relief', code: '4300-050-090-325', activity: 'Overheads - Monthly Indirect Costs' },
    { id: 'CR-050', fs: 'Comic Relief', code: '4300-050-090-320', activity: 'Staff Development - Meals & Physical Wellness' },
    { id: 'CR-037', fs: 'Comic Relief', code: '4300-050-090-325', activity: 'Interschool debate' },
    { id: 'CR-004', fs: 'Comic Relief', code: '4000-015-007-010', activity: 'Introductory workshop for 38 CSO partners' },
];

async function runAtomicSync() {
    console.log('--- ATOMIC DATA RESTORATION START ---');

    // 1. Wipe everything to be 100% sure
    console.log('Clearing database tables...');
    await supabase.from('payment_requests').delete().neq('id', 'NONE');
    await supabase.from('budget_lines').delete().neq('id', 'NONE');

    // 2. Load the full 98 lines from budgetData.js
    const { budgetLines } = await import('./src/data/budgetData.js');
    console.log(`Pushing ${budgetLines.length} budget lines...`);
    const blPayload = budgetLines.map(l => ({
        id: l.id, funding_source: l.fundingSource, strategic_pillar: l.strategicPillar,
        objective: l.objective, activity: l.activity, budget_code: l.budgetCode,
        odoo_code: l.odooCode, odoo_category: l.odooCategory, zgf_code: l.zgfCode,
        total_cost: l.totalCost, q1: l.q1, q2: l.q2, q3: l.q3, q4: l.q4,
        spent: 0, currency: 'ZMW'
    }));
    const { error: blErr } = await supabase.from('budget_lines').insert(blPayload);
    if (blErr) throw new Error(`Budget Line Insert Failed: ${blErr.message}`);

    // 3. Process CSV with Robust Parser
    console.log('Processing 219 Payment Requests from CSV...');
    const csv = fs.readFileSync('approved_requests_2026_updated.csv', 'utf8').trim();
    const rows = csv.split('\n').filter(l => l.trim()).slice(1);
    
    const prs = [];
    let totalAmt = 0;

    for (const row of rows) {
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

        // Definitive Mapping Logic
        let bId = null;
        let fs = rawFS.toLowerCase();
        if (fs.includes('kalulu')) fs = 'kaluluii';
        if (fs.includes('mott')) fs = 'mottiii';

        const match = budgetLines.find(bl => (bl.budgetCode === bCode || bl.zgfCode === bCode) && bl.fundingSource.toLowerCase().includes(fs.substring(0,4)));
        if (match) bId = match.id;
        else {
            // Fallbacks
            if (bCode === '5.3.1' || name.toLowerCase().includes('staff') || name.toLowerCase().includes('salary')) {
                if (fs === 'zgf') bId = 'ZGF-005';
                else if (fs === 'kaluluii') bId = 'KL-041';
                else if (fs === 'mottiii') bId = 'MT-030';
                else bId = 'CR-053';
            } else if (name.toLowerCase().includes('health talk') || name.toLowerCase().includes('women')) {
                bId = 'CR-050';
            } else if (fs.includes('comic')) bId = 'CR-055';
            else bId = budgetLines.find(bl => bl.fundingSource.toLowerCase().includes(fs.substring(0,4)))?.id || 'CR-055';
        }

        prs.push({
            id: `PR-${p[0]}`, name: p[1], amount: amt, status: 'Approved',
            budget_line_id: bId, year: 2026, requested_by: p[2],
            funding_source: p[4], date: '2026-01-01'
        });
        totalAmt += amt;
    }

    console.log(`Pushing 219 Payment Requests (Total K ${totalAmt.toLocaleString()})...`);
    const { error: prErr } = await supabase.from('payment_requests').insert(prs);
    if (prErr) throw new Error(`PR Insert Failed: ${prErr.message}`);

    // 4. Aggregate Spent
    console.log('Recalculating Budget Line spent totals...');
    const spentMap = {};
    prs.forEach(pr => {
        if (pr.budget_line_id) spentMap[pr.budget_line_id] = (spentMap[pr.budget_line_id] || 0) + pr.amount;
    });

    let updated = 0;
    for (const [id, amt] of Object.entries(spentMap)) {
        const { error } = await supabase.from('budget_lines').update({ spent: amt }).eq('id', id);
        if (!error) updated++;
    }

    console.log(`--- SYNC COMPLETE: ${updated} budget lines updated. Total Spent: K ${totalAmt.toLocaleString()} ---`);
}

runAtomicSync().catch(e => {
    console.error('FATAL ERROR DURING SYNC:', e.message);
    process.exit(1);
});
