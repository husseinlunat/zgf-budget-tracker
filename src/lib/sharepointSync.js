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
 * Parse a raw SharePoint string/number amount into ZMW.
 * If the amount contains 'USD' or '$', it extracts the number and multiplies by 25.
 */
function parseAmountZmw(rawTotal) {
    if (rawTotal === null || rawTotal === undefined) return 0;

    // First, try parsing straight numbers
    if (typeof rawTotal === 'number') return rawTotal;

    // Convert to string to parse currency symbols
    const s = String(rawTotal).trim().toUpperCase();

    // Remove commas
    const noCommas = s.replace(/,/g, '');

    // Check if USD
    if (noCommas.includes('USD') || noCommas.includes('$')) {
        const match = noCommas.match(/[\d\.]+/);
        if (match) {
            const usdAmount = parseFloat(match[0]);
            return usdAmount * 25; // 1 USD = 25 ZMW conversion
        }
        return 0;
    }

    // Check if ZMW (could have 'K' or 'ZMW' prefix)
    const match = noCommas.match(/[\d\.]+/);
    if (match) {
        return parseFloat(match[0]);
    }

    return parseFloat(rawTotal) || 0;
}

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
    // Using exact internal names discovered from the SharePoint schema:
    // Title -> name
    // Budgetcode -> budget_code
    // Year -> year
    // Amount_x0028_ZMW_x0029_ or Total -> amount
    // Author or RequestedBy -> requested_by
    // Nameofactivity -> name/activity
    // Payee -> payee
    // Fundingsource0 -> fundingSource
    const endpoint =
        `/sites/${SP_SITE_ID}/lists/${SP_LIST_ID}/items` +
        `?expand=fields(select=id,Title,Budgetcode,BudgetLineID,Year,Amount_x0028_ZMW_x0029_,Total,AuthorLookupId,RequestedBy,Nameofactivity,Payee,Fundingsource0,_ApprovalStatus,Approvalstatus)` +
        `&$top=999`

    const json = await graphGet(endpoint)
    const items = json.value || []

    return items
        .map((item) => {
            const f = item.fields || {}
            // Normalize approval status checking multiple possible internal names
            const rawStatus = f._ApprovalStatus || f.Approvalstatus || f.ApprovalStatus || 'Pending'

            return {
                id: `PR-${f.id || item.id}`,
                sharepoint_id: parseInt(f.id || item.id, 10),
                name: f.Nameofactivity || f.Title || 'Unnamed Request', // Activity/Purpose
                budget_code: f.Budgetcode || '',
                budget_line_id: f.BudgetLineID || null, // Will be mapped later if needed
                year: parseInt(f.Year, 10) || new Date().getFullYear(),
                amount: parseAmountZmw(f.Total || f.Amount_x0028_ZMW_x0029_ || f.Amount), // USD to ZMW conversion included
                requested_by: f.RequestedBy || f.AuthorLookupId || 'Unknown',
                payee: f.Payee || '',
                funding_source: Array.isArray(f.Fundingsource0) ? f.Fundingsource0.join(', ') : (f.Fundingsource0 || ''),
                status: mapStatus(rawStatus),
                date: (item.createdDateTime || new Date().toISOString()).split('T')[0],
                synced_at: new Date().toISOString(),
            }
        })
        .filter(item => item.year === 2026) // Only calculate requests with the year "2026"
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
