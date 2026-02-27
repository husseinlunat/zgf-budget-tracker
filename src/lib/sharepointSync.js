/**
 * SharePoint Sync Service
 *
 * Fetches the "Payment Requests" list from SharePoint via Microsoft Graph API,
 * upserts rows into Supabase, and triggers auto-deduction for newly-approved items.
 *
 * SharePoint list field mapping:
 *   Title          → name
 *   BudgetCode     → budgetCode   (SharePoint internal name)
 *   BudgetLineID   → budgetLineId (SharePoint internal name — must match budget_lines.id)
 *   Year           → year
 *   Amount         → amount
 *   RequestedBy    → requestedBy
 *   ApprovalStatus → status       (values: Pending / Approved / Rejected)
 */

import { graphGet, isMsalConfigured } from './graphClient'
import { supabase, isSupabaseConfigured } from './supabaseClient'

const SP_SITE_ID = import.meta.env.VITE_SHAREPOINT_SITE_ID || ''
const SP_LIST_ID = import.meta.env.VITE_SHAREPOINT_LIST_ID || ''

export const isSharePointConfigured =
    isMsalConfigured && Boolean(SP_SITE_ID && SP_LIST_ID)

/**
 * Fetch all items from the SharePoint "Payment Requests" list.
 * Returns an array of mapped objects ready to upsert into Supabase.
 */
export async function fetchSharePointRequests() {
    if (!isSharePointConfigured) {
        throw new Error(
            'SharePoint not configured. Set VITE_SHAREPOINT_SITE_ID and VITE_SHAREPOINT_LIST_ID.'
        )
    }

    // Graph API: get list items with expanded fields
    const endpoint =
        `/sites/${SP_SITE_ID}/lists/${SP_LIST_ID}/items` +
        `?expand=fields(select=id,Title,BudgetCode,BudgetLineID,Year,Amount,RequestedBy,ApprovalStatus)` +
        `&$top=999`

    const json = await graphGet(endpoint)
    const items = json.value || []

    return items.map((item) => {
        const f = item.fields || {}
        return {
            id: `PR-${f.id || item.id}`,
            sharepoint_id: parseInt(f.id || item.id, 10),
            name: f.Title || '',
            budget_code: f.BudgetCode || '',
            budget_line_id: f.BudgetLineID || null,
            year: parseInt(f.Year, 10) || new Date().getFullYear(),
            amount: parseFloat(f.Amount) || 0,
            requested_by: f.RequestedBy || '',
            status: mapStatus(f.ApprovalStatus),
            date: (item.createdDateTime || new Date().toISOString()).split('T')[0],
            synced_at: new Date().toISOString(),
        }
    })
}

/**
 * Normalise SharePoint approval status values to our enum.
 */
function mapStatus(raw) {
    if (!raw) return 'Pending'
    const s = String(raw).trim().toLowerCase()
    if (s === 'approved') return 'Approved'
    if (s === 'rejected' || s === 'declined') return 'Rejected'
    return 'Pending'
}

/**
 * syncFromSharePoint
 *
 * Full sync pipeline:
 * 1. Fetch all items from SharePoint
 * 2. Upsert into Supabase payment_requests
 *    → The DB trigger handle_approval() automatically deducts from budget_lines
 *       when status changes to Approved
 * 3. Return a summary { synced, approved, errors }
 */
export async function syncFromSharePoint() {
    if (!isSupabaseConfigured) {
        throw new Error('Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
    }

    const items = await fetchSharePointRequests()

    const results = { synced: 0, approved: 0, errors: [] }

    for (const item of items) {
        try {
            const { error } = await supabase
                .from('payment_requests')
                .upsert(item, { onConflict: 'id' })

            if (error) {
                results.errors.push(`${item.id}: ${error.message}`)
            } else {
                results.synced++
                if (item.status === 'Approved') results.approved++
            }
        } catch (err) {
            results.errors.push(`${item.id}: ${err.message}`)
        }
    }

    return results
}

/**
 * manualApprove
 *
 * Manually approve a payment request (e.g., from the UI without SharePoint sync).
 * The DB trigger will handle the budget deduction automatically.
 */
export async function manualApprove(requestId) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured.')
    const { data, error } = await supabase
        .from('payment_requests')
        .update({ status: 'Approved', synced_at: new Date().toISOString() })
        .eq('id', requestId)
        .select()
        .single()
    if (error) throw error
    return data
}

/**
 * manualReject
 *
 * Manually reject a payment request. DB trigger reverses any deduction.
 */
export async function manualReject(requestId) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured.')
    const { data, error } = await supabase
        .from('payment_requests')
        .update({ status: 'Rejected', synced_at: new Date().toISOString() })
        .eq('id', requestId)
        .select()
        .single()
    if (error) throw error
    return data
}
