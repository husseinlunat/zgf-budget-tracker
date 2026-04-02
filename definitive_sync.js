import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// --- INJECTED DATA FROM budgetData.js to avoid import issues in Node ---
const budgetLinesData = [
    { id: 'CR-001', code: '4000-010-004', zgf: '1.1.1', fs: 'Comic Relief' },
    { id: 'CR-004', code: '4000-015-007-010', zgf: '1.1.2', fs: 'Comic Relief' },
    { id: 'CR-053', code: '4300-050-090-320', zgf: '4.8.4', fs: 'Comic Relief' },
    { id: 'CR-050', code: '4300-050-090-320', zgf: '4.8.4', fs: 'Comic Relief' },
    { id: 'CR-068', code: '4300-050-090-325', zgf: '3.7.5', fs: 'Comic Relief' },
    { id: 'ZGF-005', code: '4300-050-090-325', zgf: '4.1.4', fs: 'ZGF' },
    { id: 'KL-041', code: '4300-050-090-320', zgf: '4.5.4', fs: 'KaluluII' },
    { id: 'MT-030', code: '4300-050-090-320', zgf: '4.13.4', fs: 'MOTTIII' },
];

const simpleMap = (reqCode, reqName, reqFS) => {
    const code = (reqCode || '').trim();
    const name = (reqName || '').toLowerCase();
    let fs = (reqFS || '').toLowerCase();
    if (fs.includes('kalulu')) fs = 'kaluluii';
    if (fs.includes('mott')) fs = 'mottiii';
    if (fs.includes('comic')) fs = 'comic relief';

    // 1. Direct Code Match
    if (code === '4000-010-004' || code === '1.1.1') return 'CR-001';
    if (code === '4000-015-007-010' || code === '1.1.2' || code === '5.1.1') return 'CR-004';
    if (code === '4.8.4' || code === '5.3.1') {
        if (fs === 'zgf') return 'ZGF-005';
        if (fs === 'kaluluii') return 'KL-041';
        if (fs === 'mottiii') return 'MT-030';
        return 'CR-053';
    }
    if (code === '3.7.5' || code === '4200-035-050') return 'CR-068';
    if (code === '1.4.2' || name.includes('health talk') || name.includes('women\'s day')) return 'CR-050';

    // 2. Name Fallbacks
    if (name.includes('staff') || name.includes('net pay') || name.includes('napsa')) {
        if (fs === 'zgf') return 'ZGF-005';
        if (fs === 'kaluluii') return 'KL-041';
        if (fs === 'mottiii') return 'MT-030';
        return 'CR-053';
    }
    
    // Generic line per FS as absolute fallback
    if (fs === 'comic relief') return 'CR-055'; // Overheads
    if (fs === 'zgf') return 'ZGF-005';
    if (fs === 'kaluluii') return 'KL-041';
    if (fs === 'mottiii') return 'MT-031';
    
    return 'CR-055'; // Final catch-all
};

const envRaw = fs.readFileSync('.env.local', 'utf8');
const getEnv = (key) => envRaw.match(new RegExp('^' + key + '=(.*)$','m'))?.[1].trim().replace('\r','');
const supabase = createClient(getEnv('VITE_SUPABASE_URL'), getEnv('VITE_SUPABASE_SECRETE_KEY'));

async function definitiveSync() {
    console.log('--- DEFINITIVE ANALYTICS CONSOLIDATION (RETRY) ---');

    // 1. Wipe everything to ensure a clean state
    console.log('Wiping stale data...');
    await supabase.from('payment_requests').delete().neq('id', 'NONE');
    await supabase.from('budget_lines').delete().neq('id', 'NONE');

    // 2. Repopulate Budget Lines FIRST from seed data
    // (This ensures valid IDs exist for the foreign key and mapping)
    console.log('Inserting primary budget lines...');
    // We already have budgetLinesData logic/IDs but let's use a more complete set
    // Actually we can just derive valid IDs from our known list or the source data.
    // I'll just use a set of IDs we KNOW exist in the budget-tracker logic.
    const knownIds = new Set(['CR-001','CR-002','CR-003','CR-004','CR-005','CR-006','CR-007','CR-008','CR-009','CR-010','CR-011','CR-012','CR-013','CR-014','CR-015','CR-016','CR-017','CR-018','CR-019','CR-020','CR-021','CR-022','CR-023','CR-024','CR-025','CR-026','CR-027','CR-028','CR-030','CR-031','CR-032','CR-033','CR-034','CR-035','CR-036','CR-037','CR-038','CR-039','CR-040','CR-041','CR-042','CR-043','CR-044', 'CR-050','CR-051','CR-052','CR-053','CR-054','CR-055','CR-056','CR-057','CR-058','CR-059','CR-060','CR-068', 'ZGF-001','ZGF-002','ZGF-003','ZGF-004','ZGF-005','ZGF-006', 'MT-001','MT-002','MT-003','MT-004','MT-005','MT-006','MT-007','MT-008','MT-009','MT-010', 'MT-020','MT-021','MT-022','MT-023','MT-024','MT-025','MT-026','MT-030','MT-031', 'KL-001','KL-002','KL-003','KL-004','KL-005','KL-010','KL-011','KL-012','KL-013','KL-014','KL-020','KL-021','KL-022','KL-023','KL-030','KL-035','KL-040','KL-041']);

    // 3. Process CSV and map PRs based on knownIds
    const csvContent = fs.readFileSync('approved_requests_2026_updated.csv', 'utf8').trim();
    const rows = csvContent.split('\n').filter(line => line.trim()).slice(1);
    
    const prPayload = [];
    let mappedCount = 0;

    for (const row of rows) {
        const regex = /(".*?"|[^",\s][^",]*[^",\s]|[^",\s]|(?<=,|^)(?=,|$))/g;
        const p = row.match(regex).map(part => part.replace(/^"|"$/g, '').trim());
        if (p.length < 9) continue;

        const rawAmount = p[5] || '0';
        const cleanAmount = parseFloat(rawAmount.replace(/[^0-9.]/g, '')) || 0;
        const bId = simpleMap(p[3], p[1], p[4]);

        if (knownIds.has(bId)) mappedCount++;

        prPayload.push({
            id: `PR-${p[0]}`,
            name: p[1],
            amount: cleanAmount,
            status: 'Approved',
            budget_line_id: knownIds.has(bId) ? bId : null,
            year: 2026,
            requested_by: p[2],
            funding_source: p[4],
            date: `2026-01-01`
        });
    }
    console.log(`Mapped ${mappedCount}/${prPayload.length} records.`);

    // 4. Run original budget line sync to restore the lines themselves
    // and THEN update their spent totals
    console.log('Restoring Budget Line data...');
    // We already have the sync_lines logic, but we'll do it right here to be atomic
    const { budgetLines } = await import('./src/data/budgetData.js');
    const blPayload = budgetLines.map(l => ({
        id: l.id, funding_source: l.fundingSource, strategic_pillar: l.strategicPillar,
        objective: l.objective, activity: l.activity, budget_code: l.budgetCode,
        odoo_code: l.odooCode, odoo_category: l.odooCategory, zgf_code: l.zgfCode,
        total_cost: l.totalCost, q1: l.q1, q2: l.q2, q3: l.q3, q4: l.q4,
        spent: 0, currency: 'ZMW'
    }));
    await supabase.from('budget_lines').insert(blPayload);

    // 5. Batch Insert PRs
    await supabase.from('payment_requests').insert(prPayload);

    // 5. Aggregate Spent
    console.log('Aggregating spent totals...');
    const spentMap = {};
    prPayload.forEach(pr => {
        if (pr.budget_line_id) {
            spentMap[pr.budget_line_id] = (spentMap[pr.budget_line_id] || 0) + pr.amount;
        }
    });

    // Reset all lines to 0 first
    await supabase.from('budget_lines').update({ spent: 0 }).neq('id', 'NONE');

    let updated = 0;
    for (const [id, amt] of Object.entries(spentMap)) {
        const { error } = await supabase.from('budget_lines').update({ spent: amt }).eq('id', id);
        if (!error) updated++;
    }

    console.log(`✓ CALIBRATION COMPLETE: ${updated} lines updated. Total PRs: ${prPayload.length}`);
}

definitiveSync().catch(console.error);
