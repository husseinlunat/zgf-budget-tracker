import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { budgetLines, findBudgetLineId } from './src/data/budgetData.js';

const envRaw = fs.readFileSync('.env.local', 'utf8');
const getEnv = (key) => envRaw.match(new RegExp('^' + key + '=(.*)$','m'))?.[1].trim().replace('\r','');
const supabase = createClient(getEnv('VITE_SUPABASE_URL'), getEnv('VITE_SUPABASE_SECRETE_KEY'));

async function totalSync() {
    console.log('--- DEFINITIVE ANALYTICS CONSOLIDATION ---');

    // 1. Reset Dashboard Data to ensure clean state
    console.log('Wiping stale analytics data...');
    await supabase.from('payment_requests').delete().neq('id', 'NONE');
    await supabase.from('budget_lines').delete().neq('id', 'NONE');

    // 2. Repopulate Master Budget Lines (98 lines)
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

    // 3. Sync Payment Requests (219 requests)
    console.log('Parsing and Pushing 219 Payment Requests from CSV...');
    const csvContent = fs.readFileSync('approved_requests_2026_updated.csv', 'utf8').trim();
    const rows = csvContent.split('\n').filter(line => line.trim()).slice(1);
    
    const prPayload = [];
    let totalValueProcessed = 0;

    for (const row of rows) {
        const regex = /(".*?"|[^",\s][^",]*[^",\s]|[^",\s]|(?<=,|^)(?=,|$))/g;
        const p = row.match(regex).map(part => part.replace(/^"|"$/g, '').trim());
        if (p.length < 9) continue;

        const rawAmount = p[5] || '0';
        const cleanAmount = parseFloat(rawAmount.replace(/[^0-9.]/g, '')) || 0;
        const cleanYear = parseInt(p[8]) || 2026;
        totalValueProcessed += cleanAmount;

        const bId = findBudgetLineId({ budget_code: p[3], name: p[1], funding_source: p[4] });

        prPayload.push({
            id: `PR-${p[0]}`,
            name: p[1],
            amount: cleanAmount,
            status: p[7] || 'Approved',
            budget_code: p[3],
            budget_line_id: bId || null,
            year: cleanYear,
            requested_by: p[2],
            funding_source: p[4],
            date: `${cleanYear}-01-01`,
            synced_at: new Date().toISOString()
        });
    }

    // Insert requests sequentially to be safe
    for (const pr of prPayload) {
        const { error: prErr } = await supabase.from('payment_requests').insert([pr]);
        if (prErr) {
            console.warn(`   Skipping broken PR ${pr.id}: ${prErr.message} (Linking to ${pr.budget_line_id})`);
        }
    }
    console.log(`✓ Payment Requests Synced. Total Value: ZMW ${totalValueProcessed.toFixed(2)}`);

    // 4. Final Aggregation Step: Spent Totals
    console.log('Aggregating Spent totals onto Budget Lines...');
    const { data: approvedPRs } = await supabase.from('payment_requests').select('budget_line_id, amount').eq('status', 'Approved');
    const spentMap = {};
    approvedPRs.forEach(pr => {
        if (pr.budget_line_id) {
            spentMap[pr.budget_line_id] = (spentMap[pr.budget_line_id] || 0) + Number(pr.amount);
        }
    });

    let linesUpdatedCount = 0;
    for (const [lineId, totalAmt] of Object.entries(spentMap)) {
        const { error: updErr } = await supabase.from('budget_lines').update({ spent: totalAmt }).eq('id', lineId);
        if (!updErr) linesUpdatedCount++;
    }

    console.log(`✓ ANALYTICS CALIBRATED: ${linesUpdatedCount} budget lines now correctly show their spent totals.`);
    console.log('--- CONSOLIDATED FINAL SYNC COMPLETE ---');
}

totalSync().catch(console.error);
