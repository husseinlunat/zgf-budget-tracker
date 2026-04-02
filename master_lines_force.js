import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { budgetLines } from './src/data/budgetData.js';

const envRaw = fs.readFileSync('.env.local', 'utf8');
const getEnv = (key) => envRaw.match(new RegExp('^' + key + '=(.*)$','m'))?.[1].trim().replace('\r','');
const supabase = createClient(getEnv('VITE_SUPABASE_URL'), getEnv('VITE_SUPABASE_SECRETE_KEY'));

async function force() {
    console.log('--- FORCED BUDGET LINE INSERT ---');
    const payload = budgetLines.map(l => ({
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

    let success = 0;
    for(const r of payload) {
        const { error } = await supabase.from('budget_lines').upsert([r]);
        if (!error) success++;
        else console.warn(`FAIL ${r.id}: ${error.message}`);
    }
    console.log(`Final Success Count: ${success}/${payload.length}`);
}

force().catch(console.error);
