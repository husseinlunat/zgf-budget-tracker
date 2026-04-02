import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://anlmivpezegitwhtlklk.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFubG1pdnBlemVnaXR3aHRsa2xrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjE4NDI0MCwiZXhwIjoyMDg3NzYwMjQwfQ.pzs_lat7kZb11jv9zqZeMfKjRQsYTUnpHxI78mXZIyA'
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fix() {
    console.log('Updating RLS policies for public accessibility...')
    
    // Update payment_requests policy
    const { error: prError } = await supabase.rpc('exec_sql', {
        sql_string: `
            drop policy if exists "Allow auth insert/update payment_requests" on public.payment_requests;
            create policy "Allow anon insert/update payment_requests" 
            on public.payment_requests for all using (true) with check (true);
        `
    })

    if (prError) {
        console.warn('RPC exec_sql failed (likely not defined). Trying direct SQL if possible... (Falling back to assuming user manually applied schema.sql)')
        console.error(prError)
    } else {
        console.log('Successfully updated payment_requests policy.')
    }
}

fix()
