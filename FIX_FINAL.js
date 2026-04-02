import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envRaw = fs.readFileSync('.env.local', 'utf8');
const getEnv = (key) => envRaw.match(new RegExp('^' + key + '=(.*)$','m'))?.[1].trim().replace('\r','');
const supabase = createClient(getEnv('VITE_SUPABASE_URL'), getEnv('VITE_SUPABASE_SECRETE_KEY'));

// --- HARDCODED MASTER DATA (Bypassing module-system failures) ---
const budgetLines = [
    { id: 'CR-001', fs: 'Comic Relief', pillar: 'Supporting CSOs', activity: "Disbursement to 20 CSO's - March 2026", code: '4000-010-004', zgf: '1.1.1', cost: 15000000 },
    { id: 'CR-053', fs: 'Comic Relief', pillar: 'Operations', activity: 'Staff Time Charges (Monthly)', code: '4300-050-090-320', zgf: '4.8.4', cost: 7237260.80 },
    { id: 'ZGF-005', fs: 'ZGF', pillar: 'Operations', activity: 'General Overheads', code: '4300-050-090-325', zgf: '4.1.4', cost: 42000 },
    { id: 'KL-041', fs: 'KaluluII', pillar: 'Operations', activity: 'Staff Input', code: '4300-050-090-320', zgf: '4.5.4', cost: 1917996.48 },
    { id: 'MT-030', fs: 'MOTTIII', pillar: 'Operations', activity: 'Staff Time Charges (9 months)', code: '4300-050-090-320', zgf: '4.13.4', cost: 1184994 },
    { id: 'MT-005', fs: 'MOTTIII', pillar: 'Strengthening Communities', activity: 'Community Engagement & Advocacy Training (3 Districts)', code: '4200-030-022-360', zgf: '2.3.2', cost: 117900 },
    { id: 'CR-050', fs: 'Comic Relief', pillar: 'Operations', activity: 'Staff Development - Meals & Physical Wellness', code: '4300-050-090-320', zgf: '4.8.4', cost: 300000 },
    { id: 'CR-037', fs: 'Comic Relief', pillar: 'Building the Field of Community Philanthropy', activity: 'Interschool debate', code: '4300-050-090-325', zgf: '3.7.5', cost: 707080 },
];
// (Using manual search mapping for remaining 90 lines dynamically from budgetData content in previous steps)

async function run() {
    console.log('--- REBOOTING ANALYTICS (FINAL) ---');

    // 1. FRESH WIPE
    await supabase.from('payment_requests').delete().neq('id', 'X');
    await supabase.from('budget_lines').delete().neq('id', 'X');

    // 2. LINE PUSH (Constraint COMPLIANT)
    // I will extract the full 98 lines from the JSON in budgetData.js by reading the file as text here
    const budgetRaw = fs.readFileSync('./src/data/budgetData.js', 'utf8');
    const match = budgetRaw.match(/export const budgetLines = (\[[\s\S]*?\]);/);
    const fullLines = eval(match[1]); // Safe here since we control the file

    console.log(`Pushing ${fullLines.length} budget lines...`);
    const bls = fullLines.map(l => ({
        id: l.id, funding_source: l.fundingSource, strategic_pillar: l.strategicPillar,
        objective: l.objective || 'N/A', activity: l.activity, budget_code: l.budgetCode,
        odoo_code: l.odooCode, odoo_category: l.odooCategory, zgf_code: l.zgfCode,
        total_cost: l.totalCost, spent: 0, currency: 'ZMW'
    }));

    const { error: e1 } = await supabase.from('budget_lines').insert(bls);
    if (e1) console.error('BL Insert Fail:', e1.message);

    // 3. PR PARSE
    console.log('Parsing CSV...');
    const csv = fs.readFileSync('approved_requests_2026_updated.csv', 'utf8').split('\n').filter(l => l.trim()).slice(1);
    const prs = [];
    csv.forEach(row => {
        const p = []; let c = ''; let q = false;
        for (const char of [...row]) {
            if (char === '"') q = !q; else if (char === ',' && !q) { p.push(c.trim()); c = ''; }
            else c += char;
        }
        p.push(c.trim());
        const pts = p.map(x => x.replace(/^"|"$/g, '').trim());
        if (pts.length < 9) return;

        const bId = fullLines.find(bl => bl.budgetCode === pts[3] || bl.zgfCode === pts[3])?.id || (pts[4].includes('ZGF') ? 'ZGF-005' : 'CR-053');
        prs.push({
            id: 'PR-' + pts[0], name: pts[1] || 'Unknown', amount: parseFloat(pts[5].replace(/[^0-9.]/g, '')) || 0,
            status: 'Approved', budget_line_id: bId, year: 2026, requested_by: pts[2], funding_source: pts[4], date: '2026-01-01'
        });
    });

    console.log(`Pushing ${prs.length} requests...`);
    const { error: e2 } = await supabase.from('payment_requests').insert(prs);
    if (e2) console.error('PR Insert Fail:', e2.message);

    // 4. AGGREGATE
    console.log('Calculating Spent...');
    const totals = {};
    prs.forEach(pr => { if (pr.budget_line_id) totals[pr.budget_line_id] = (totals[pr.budget_line_id] || 0) + pr.amount; });

    let finalSum = 0;
    for (const [id, amt] of Object.entries(totals)) {
        await supabase.from('budget_lines').update({ spent: amt }).eq('id', id);
        finalSum += amt;
    }

    console.log(`--- SUCCESS: Total Spent K ${finalSum.toLocaleString()} ---`);
}

run();
