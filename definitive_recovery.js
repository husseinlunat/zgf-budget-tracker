import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envRaw = fs.readFileSync('.env.local', 'utf8');
const getEnv = (key) => envRaw.match(new RegExp('^' + key + '=(.*)$','m'))?.[1].trim().replace('\r','');
const supabase = createClient(getEnv('VITE_SUPABASE_URL'), getEnv('VITE_SUPABASE_SECRETE_KEY'));

async function definitiveSync() {
    console.log('--- DEFINITIVE ANALYTICS RECOVERY ---');

    // 1. Wipe everything
    console.log('Clearing old data...');
    await supabase.from('payment_requests').delete().neq('id', 'NONE');
    await supabase.from('budget_lines').delete().neq('id', 'NONE');

    // 2. Fetch seed data correctly
    const { budgetLines } = await import('./src/data/budgetData.js');
    console.log(`Inserting ${budgetLines.length} Budget Lines...`);

    const blPayload = budgetLines.map(l => ({
        id: l.id, funding_source: l.fundingSource, strategic_pillar: l.strategicPillar,
        objective: l.objective, activity: l.activity, budget_code: l.budgetCode,
        odoo_code: l.odooCode, odoo_category: l.odooCategory, zgf_code: l.zgfCode,
        total_cost: l.totalCost, q1: l.q1, q2: l.q2, q3: l.q3, q4: l.q4,
        spent: 0, currency: 'ZMW'
    }));
    const { error: blErr } = await supabase.from('budget_lines').insert(blPayload);
    if (blErr) throw blErr;

    // 3. Process CSV
    console.log('Parsing CSV...');
    const csv = fs.readFileSync('approved_requests_2026_updated.csv', 'utf8').trim();
    const rows = csv.split('\n').filter(l => l.trim()).slice(1);
    const prPayload = [];

    // Mapping function within the same scope to be absolutely sure
    const mapToLine = (code, name, fs) => {
        const c = (code || '').trim();
        const n = (name || '').toLowerCase();
        let f = (fs || '').toLowerCase();
        if (f.includes('kalulu')) f = 'kaluluii';
        if (f.includes('mott')) f = 'mottiii';

        if (c === '1.1.1' || c === '4000-010-004') return 'CR-001';
        if (c === '1.1.2' || c === '4000-015-007-010' || c === '5.1.1') return 'CR-004';
        if (c === '4.8.4' || c === '5.3.1' || n.includes('staff')) {
            if (f === 'zgf') return 'ZGF-005';
            if (f === 'kaluluii') return 'KL-041';
            if (f === 'mottiii') return 'MT-030';
            return 'CR-053';
        }
        if (c === '3.7.5' || n.includes('media')) return 'CR-037';
        if (c === '1.4.2' || n.includes('health')) return 'CR-050';
        
        // Match by budgetCode exactly
        const match = budgetLines.find(bl => bl.budgetCode === c && bl.fundingSource.toLowerCase().includes(f.substring(0,4)));
        if (match) return match.id;

        // Fallbacks
        if (f === 'kaluluii') return 'KL-001';
        if (f === 'mottiii') return 'MT-001';
        if (f === 'zgf') return 'ZGF-005';
        return 'CR-055';
    };

    let totalVal = 0;
    for (const row of rows) {
        // Robust CSV Parser for quoted commas
        const parts = [];
        let cur = '';
        let q = false;
        for (const c of [...row]) {
            if (c === '"') q = !q;
            else if (c === ',' && !q) { parts.push(cur.trim()); cur = ''; }
            else cur += c;
        }
        parts.push(cur.trim());
        const p = parts.map(x => x.replace(/^"|"$/g, '').trim());

        if (p.length < 9) continue;

        const rawAmt = p[5] || '0';
        const amt = parseFloat(rawAmt.replace(/[^0-9.]/g, '')) || 0;
        const bId = mapToLine(p[3], p[1], p[4]);
        
        if (amt > 0) totalVal += amt;

        prPayload.push({
            id: `PR-${p[0]}`, name: p[1], amount: amt, status: 'Approved',
            budget_line_id: bId, year: 2026, requested_by: p[2],
            funding_source: p[4], date: '2026-01-01'
        });
    }

    console.log(`Pushing 219 PRs. TOTAL VALUE CALCULATED: K ${totalVal.toLocaleString()}`);
    const { error: prErr } = await supabase.from('payment_requests').insert(prPayload);
    if (prErr) throw prErr;

    // 4. Update spent totals
    console.log('Final aggregation...');
    const totals = {};
    prPayload.forEach(pr => {
        if (pr.budget_line_id) totals[pr.budget_line_id] = (totals[pr.budget_line_id] || 0) + pr.amount;
    });

    let updated = 0;
    for (const [id, amt] of Object.entries(totals)) {
        const { error } = await supabase.from('budget_lines').update({ spent: amt }).eq('id', id);
        if (!error) updated++;
    }

    console.log(`Sync Complete. ${updated} lines updated.`);
}

definitiveSync().catch(console.error);
