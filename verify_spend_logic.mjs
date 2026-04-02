import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://anlmivpezegitwhtlklk.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFubG1pdnBlemVnaXR3aHRsa2xrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjE4NDI0MCwiZXhwIjoyMDg3NzYwMjQwfQ.pzs_lat7kZb11jv9zqZeMfKjRQsYTUnpHxI78mXZIyA'
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verify() {
    console.log('Fetching live data from Supabase...')
    
    const { data: lines } = await supabase.from('budget_lines').select('*')
    const { data: reqs }  = await supabase.from('payment_requests').select('*').eq('year', 2026)

    console.log(`Loaded ${lines?.length} lines and ${reqs?.length} requests.`)

    // Logic from useComputedLines.js
    const spentByLineId = {}
    reqs.forEach((r) => {
        if (String(r.status).toLowerCase() === 'approved') {
            const lineId = r.budget_line_id // DB Field name
            if (lineId) {
                spentByLineId[lineId] = (spentByLineId[lineId] || 0) + Number(r.amount)
            }
        }
    })

    let totalBudget = 0
    let totalSpent = 0

    lines.forEach(l => {
        const spent = spentByLineId[l.id] || 0
        totalBudget += Number(l.total_cost)
        totalSpent += spent
    })

    console.log('--- RESULTS ---')
    console.log('Total Budget:', totalBudget)
    console.log('Total Spent:', totalSpent)
    console.log('Utilisation:', ((totalSpent / totalBudget) * 100).toFixed(2), '%')
    
    if (totalSpent > 0) {
        console.log('✅ SUCCESS: Spend calculation is working with live data.')
    } else {
        console.log('❌ FAILURE: Spend is still 0. Check ID matching.')
    }
}

verify()
