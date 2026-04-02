import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
// Using absolute path for safety during import
import parsedRequests from './seedPaymentRequests.js';

// Read .env.local manually from the root
const rootPath = process.cwd();
const envPath = path.join(rootPath, '.env.local');
console.log('Reading .env.local from:', envPath);
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnv = (key) => {
    const regex = new RegExp(`^${key}=(.*)$`, 'm');
    const match = envContent.match(regex);
    return match ? match[1].replace('\r', '').trim() : null;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseSecret = getEnv('VITE_SUPABASE_SECRETE_KEY');

console.log('URL Length:', supabaseUrl?.length);
console.log('Secret Length:', supabaseSecret?.length);

if (!supabaseUrl || !supabaseSecret) {
    console.error('Error: VITE_SUPABASE_URL or VITE_SUPABASE_SECRETE_KEY missing in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseSecret);

async function sync() {
    console.log(`\n--- Supabase Synchronization ---`);
    console.log(`Target: ${supabaseUrl}`);
    console.log(`Processing: ${parsedRequests.length} records...`);

    // 1. Verify existence again
    const { status, error: tableError } = await supabase
        .from('payment_requests')
        .select('*', { head: true, count: 'exact' })
        .limit(1);

    if (tableError) {
        console.error('Table verification failed:', JSON.stringify(tableError, null, 2));
        console.log('\nTIP: If the error is PGRST205, please check your Supabase Dashboard -> Project Settings -> Database and click "Refresh Schema Cache".');
        process.exit(1);
    }
    console.log(`✓ Table found (Status: ${status})`);

    // 2. Clear existing 2026 records
    const { error: deleteError } = await supabase
        .from('payment_requests')
        .delete()
        .eq('year', 2026);

    if (deleteError) {
        console.error('Error clearing old records:', JSON.stringify(deleteError, null, 2));
        process.exit(1);
    }
    console.log('✓ Cleared old 2026 records.');

    // 3. Prepare data for insert (snake_case)
    const toInsert = parsedRequests.map(r => ({
        id: r.id,
        name: r.name,
        amount: r.amount,
        status: r.status || 'Pending',
        budget_code: r.budgetCode || r.budget_code,
        budget_line_id: r.budgetLineId,
        year: r.year || 2026,
        requested_by: r.requestedBy || r.requested_by,
        date: r.date,
        synced_at: new Date().toISOString()
    }));

    // 4. Batch Insert (50 at a time)
    const batchSize = 50;
    for (let i = 0; i < toInsert.length; i += batchSize) {
        const batch = toInsert.slice(i, i + batchSize);
        const { error: insertError } = await supabase
            .from('payment_requests')
            .insert(batch);

        if (insertError) {
            console.error(`Error inserting batch ${i / batchSize + 1}:`, JSON.stringify(insertError, null, 2));
            process.exit(1);
        }
        console.log(`✓ Inserted batch ${i / batchSize + 1} (${batch.length} items).`);
    }

    console.log('\nSUCCESS: All records synchronized with Supabase.');
    
    // Final verify
    const { count, error: countError } = await supabase
        .from('payment_requests')
        .select('*', { count: 'exact', head: true })
        .eq('year', 2026);
    
    if (!countError) {
        console.log(`Total 2026 records now in Supabase: ${count}`);
    }
}

sync().catch(err => {
    console.error('Unhandled script error:', err);
    process.exit(1);
});
