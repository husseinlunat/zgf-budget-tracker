import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envRaw = fs.readFileSync('.env.local', 'utf8');
const getEnv = (key) => envRaw.match(new RegExp('^' + key + '=(.*)$','m'))?.[1].trim().replace('\r','');
const supabase = createClient(getEnv('VITE_SUPABASE_URL'), getEnv('VITE_SUPABASE_SECRETE_KEY'));

const sql = `
-- Fix RLS Policies
DROP POLICY IF EXISTS "Allow anon read budget_lines" ON public.budget_lines;
CREATE POLICY "Allow anon read budget_lines" ON public.budget_lines FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon read payment_requests" ON public.payment_requests;
CREATE POLICY "Allow anon read payment_requests" ON public.payment_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon read deductions" ON public.deductions;
CREATE POLICY "Allow anon read deductions" ON public.deductions FOR SELECT USING (true);

-- Ensure RLS is enabled
ALTER TABLE public.budget_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deductions ENABLE ROW LEVEL SECURITY;
`;

async function apply() {
    console.log('Attempting to apply RLS policies via SQL RPC...');
    const { data, error } = await supabase.rpc('run_sql', { sql });
    if (error) {
        console.error('RPC Error (it usually means run_sql function is not defined):', error.message);
        console.log('\n--- PLEASE COPY/PASTE THIS INTO SUPABASE SQL EDITOR ---\n');
        console.log(sql);
        console.log('\n------------------------------------------------------\n');
    } else {
        console.log('✓ RLS Policies successfully updated.');
    }
}
apply();
