import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { budgetLines } from './src/data/budgetData.js';

const envRaw = fs.readFileSync('.env.local', 'utf8');
const getEnv = (key) => envRaw.match(new RegExp('^' + key + '=(.*)$','m'))?.[1].trim().replace('\r','');
const supabase = createClient(getEnv('VITE_SUPABASE_URL'), getEnv('VITE_SUPABASE_SECRETE_KEY'));

async function restore() {
    console.log('Restoring 98 Budget Lines (via UPSERT)...');
    
    // 1. Prepare data
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

    // 2. Clear first, but avoid FK block
    console.log(' - Wiping Budget Lines safely...');
    await supabase.from('budget_lines').delete().neq('id', 'NONE');

    // 3. Upsert
    const { error } = await supabase.from('budget_lines').upsert(payload, { onConflict: 'id' });
    if (error) {
        console.error('UPSERT ERROR:', error.message);
    } else {
        console.log('✓ Successfully restored budget lines.');
    }
}
restore();
