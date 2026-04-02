import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://anlmivpezegitwhtlklk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFubG1pdnBlemVnaXR3aHRsa2xrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjE4NDI0MCwiZXhwIjoyMDg3NzYwMjQwfQ.pzs_lat7kZb11jv9zqZeMfKjRQsYTUnpHxI78mXZIyA'
const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
    const { data: lines, error: lError } = await supabase.from('budget_lines').select('id, activity').limit(5)
    console.log('Sample budget line IDs:', lines.map(l => l.id))

    const { data: reqs, error: rError } = await supabase.from('payment_requests').select('budget_line_id, status, amount').eq('year', 2026).limit(5)
    console.log('Sample request line IDs:', reqs.map(r => r.budget_line_id))
    console.log('Sample request statuses:', reqs.map(r => r.status))
}

check()
