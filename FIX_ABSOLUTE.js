import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envRaw = fs.readFileSync('.env.local', 'utf8');
const getEnv = (key) => envRaw.match(new RegExp('^' + key + '=(.*)$','m'))?.[1].trim().replace('\r','');
const supabase = createClient(getEnv('VITE_SUPABASE_URL'), getEnv('VITE_SUPABASE_SECRETE_KEY'));

async function masterCalibration() {
    console.log('--- MASTER DATABASE CALIBRATION (VERBOSE) ---');

    // 1. Wipe
    await supabase.from('payment_requests').delete().neq('id', 'X');
    await supabase.from('budget_lines').delete().neq('id', 'X');

    // 2. Extract Data
    const budgetRaw = fs.readFileSync('./src/data/budgetData.js', 'utf8');
    const match = budgetRaw.match(/export const budgetLines = (\[[\s\S]*?\]);/);
    const fullLines = eval(match[1]);

    // 3. Sequential Insert of Lines
    console.log(`Inserting ${fullLines.length} budget lines...`);
    for (const l of fullLines) {
        const payload = {
            id: l.id, funding_source: l.fundingSource || 'Operations',
            strategic_pillar: l.strategicPillar || 'N/A',
            objective: l.objective || 'N/A', activity: l.activity || 'N/A',
            budget_code: l.budgetCode, odoo_code: l.odooCode,
            odoo_category: l.odooCategory, zgf_code: l.zgfCode,
            total_cost: l.totalCost, spent: 0, currency: 'ZMW'
        };
        const { error } = await supabase.from('budget_lines').insert([payload]);
        if (error) console.error(`  FAIL BL ${l.id}: ${error.message}`);
    }

    // 4. Sequential Insert of PRs
    const csv = fs.readFileSync('approved_requests_2026_updated.csv', 'utf8').split('\n').filter(l => l.trim()).slice(1);
    console.log(`Inserting ${csv.length} payment requests...`);
    for (const row of csv) {
        const p = []; let c = ''; let q = false;
        for (const char of [...row]) {
            if (char === '"') q = !q; else if (char === ',' && !q) { p.push(c.trim()); c = ''; }
            else c += char;
        }
        p.push(c.trim());
        const pts = p.map(x => x.replace(/^"|"$/g, '').trim());
        if (pts.length < 9) continue;

        const bId = fullLines.find(bl => bl.budgetCode === pts[3] || bl.zgfCode === pts[3])?.id || (pts[4].includes('ZGF') ? 'ZGF-005' : 'CR-053');
        const prPayload = {
            id: 'PR-' + pts[0], name: pts[1] || 'Unknown', amount: parseFloat(pts[5].replace(/[^0-9.]/g, '')) || 0,
            status: 'Approved', budget_line_id: bId, year: 2026, requested_by: pts[2], funding_source: pts[4], date: '2026-01-01'
        };
        const { error } = await supabase.from('payment_requests').insert([prPayload]);
        if (error) console.error(`  FAIL PR ${pts[0]}: ${error.message} (Target: ${bId})`);
    }

    // 5. Final Aggregation
    const { data: prs } = await supabase.from('payment_requests').select('budget_line_id, amount');
    const totals = {};
    prs.forEach(pr => { if (pr.budget_line_id) totals[pr.budget_line_id] = (totals[pr.budget_line_id] || 0) + Number(pr.amount); });
    
    for (const [id, amt] of Object.entries(totals)) {
        await supabase.from('budget_lines').update({ spent: amt }).eq('id', id);
    }

    console.log('--- CALIBRATION COMPLETE ---');
}

masterCalibration();
