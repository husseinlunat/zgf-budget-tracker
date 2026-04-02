import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://anlmivpezegitwhtlklk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFubG1pdnBlemVnaXR3aHRsa2xrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjE4NDI0MCwiZXhwIjoyMDg3NzYwMjQwfQ.pzs_lat7kZb11jv9zqZeMfKjRQsYTUnpHxI78mXZIyA'
const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
    const { data, error } = await supabase
        .from('payment_requests')
        .select('id, status, budget_line_id, amount, year')
        .eq('year', 2026)
    
    if (error) {
        console.error('Error fetching:', error)
        return
    }

    console.log('Total 2026 requests:', data.length)
    const approved = data.filter(r => r.status === 'Approved')
    console.log('Approved 2026 requests:', approved.length)
    
    const withLineId = approved.filter(r => r.budget_line_id)
    console.log('Approved with line ID:', withLineId.length)
    
    const totalAmount = approved.reduce((sum, r) => sum + Number(r.amount), 0)
    console.log('Total Approved Amount:', totalAmount)

    if (withLineId.length > 0) {
        console.log('Sample with line ID:', withLineId[0])
    } else if (approved.length > 0) {
        console.log('Sample approved (no line ID):', approved[0])
    }
}

check()
