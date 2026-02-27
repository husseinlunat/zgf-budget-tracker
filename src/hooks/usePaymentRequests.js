import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { samplePaymentRequests } from '../data/budgetData'

/**
 * Converts a Supabase payment_requests row (snake_case) to camelCase.
 */
function mapRow(row) {
    return {
        id: row.id,
        sharepointId: row.sharepoint_id,
        name: row.name,
        budgetCode: row.budget_code,
        budgetLineId: row.budget_line_id,
        year: row.year,
        amount: Number(row.amount),
        requestedBy: row.requested_by,
        status: row.status,
        date: row.date,
        syncedAt: row.synced_at,
    }
}

/**
 * usePaymentRequests
 * - If Supabase is configured → fetches live data + subscribes to real-time updates
 * - Otherwise → returns static seed data
 */
export function usePaymentRequests() {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchRequests = useCallback(async () => {
        if (!isSupabaseConfigured) {
            setRequests(samplePaymentRequests)
            setLoading(false)
            return
        }
        try {
            setLoading(true)
            const { data, error: err } = await supabase
                .from('payment_requests')
                .select('*')
                .order('date', { ascending: false })
            if (err) throw err
            setRequests((data || []).map(mapRow))
        } catch (err) {
            console.error('[usePaymentRequests]', err)
            setError(err.message)
            setRequests(samplePaymentRequests)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchRequests()

        if (!isSupabaseConfigured || !supabase) return

        // Real-time subscription: re-fetch on any change
        const channel = supabase
            .channel('payment_requests_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'payment_requests' }, () => {
                fetchRequests()
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [fetchRequests])

    return { requests, loading, error, refetch: fetchRequests }
}
