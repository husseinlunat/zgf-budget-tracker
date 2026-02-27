import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import {
    budgetLines as seedLines,
    samplePaymentRequests,
    computeBudgetWithSpend,
} from '../data/budgetData'

/**
 * Converts a Supabase budget_lines row (snake_case) to camelCase for the UI.
 */
function mapRow(row) {
    return {
        id: row.id,
        fundingSource: row.funding_source,
        strategicPillar: row.strategic_pillar,
        objective: row.objective,
        activity: row.activity,
        budgetCode: row.budget_code,
        odooCode: row.odoo_code,
        odooCategory: row.odoo_category,
        zgfCode: row.zgf_code,
        currency: row.currency,
        totalCost: Number(row.total_cost),
        q1: Number(row.q1),
        q2: Number(row.q2),
        q3: Number(row.q3),
        q4: Number(row.q4),
        spent: Number(row.spent),
        remaining: Number(row.total_cost) - Number(row.spent),
    }
}

/**
 * useBudgetLines
 * - If Supabase is configured → fetches live data + subscribes to real-time updates
 * - Otherwise → returns static seed data (development fallback)
 */
export function useBudgetLines() {
    const [lines, setLines] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchLines = useCallback(async () => {
        if (!isSupabaseConfigured) {
            // Fallback: use seed data with spend computed from sample requests
            setLines(computeBudgetWithSpend(seedLines, samplePaymentRequests))
            setLoading(false)
            return
        }
        try {
            setLoading(true)
            const { data, error: err } = await supabase
                .from('budget_lines')
                .select('*')
                .order('total_cost', { ascending: false })
            if (err) throw err
            setLines((data || []).map(mapRow))
        } catch (err) {
            console.error('[useBudgetLines]', err)
            setError(err.message)
            // Graceful fallback
            setLines(computeBudgetWithSpend(seedLines, samplePaymentRequests))
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchLines()

        if (!isSupabaseConfigured || !supabase) return

        // Real-time subscription: re-fetch when budget_lines changes
        const channel = supabase
            .channel('budget_lines_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'budget_lines' }, () => {
                fetchLines()
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [fetchLines])

    return { lines, loading, error, refetch: fetchLines }
}
