import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { budgetLines, findBudgetLineId } from './src/data/budgetData.js';

const envRaw = fs.readFileSync('.env.local', 'utf8');
const getEnv = (key) => envRaw.match(new RegExp('^' + key + '=(.*)$','m'))?.[1].trim().replace('\r','');
const supabase = createClient(getEnv('VITE_SUPABASE_URL'), getEnv('VITE_SUPABASE_SECRETE_KEY'));

async function force() {
    console.log('--- FORCED DATA MANIFEST ---');
    
    // 1. Fetch current table info
    const { data: currentLines } = await supabase.from('budget_lines').select('id');
    const validIds = new Set(currentLines.map(l => l.id));
    console.log(`Live Budget Lines: ${validIds.size}`);

    // 2. Parse CSV
    const csv = fs.readFileSync('approved_requests_2026_updated.csv', 'utf8').trim().split('\n').slice(1);
    const records = [];
    for (const row of csv) {
        const p = row.match(/(".*?"|[^",\s][^",]*[^",\s]|[^",\s]|(?<=,|^)(?=,|$))/g).map(part => part.replace(/^"|"$/g, '').trim());
        if (p.length < 9) continue;
        
        const rawAmount = p[5] || '0';
        // Extract only digits and decimal points to handle GBP, GH, etc.
        const cleanAmount = parseFloat(rawAmount.replace(/[^0-9.]/g, '')) || 0;
        const rawYear = p[8] || '2026';
        const cleanYear = parseInt(rawYear) || 2026;

        const bId = findBudgetLineId({ budget_code: p[3], name: p[1], funding_source: p[4] });
        records.push({
            id: `PR-${p[0]}`,
            name: p[1],
            amount: cleanAmount,
            status: p[7] || 'Approved',
            budget_code: p[3],
            budget_line_id: validIds.has(bId) ? bId : null,
            year: cleanYear,
            requested_by: p[2],
            funding_source: p[4],
            date: `${cleanYear}-01-01`
        });
    }

    console.log(`Pushing ${records.length} records...`);

    // UPSERT individually to ensure no data loss
    let success = 0;
    for (const r of records) {
        const { error } = await supabase.from('payment_requests').upsert([r]);
        if (!error) success++;
        else console.warn(`FAIL ${r.id}: ${error.message}`);
    }

    console.log(`Final Success Count: ${success}/${records.length}`);
}

force().catch(console.error);
