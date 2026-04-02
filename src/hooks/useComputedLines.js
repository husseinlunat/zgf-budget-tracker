import { useMemo } from 'react'
import { useBudgetLines } from './useBudgetLines'
import { usePaymentRequests } from './usePaymentRequests'
import { findBudgetLineId } from '../data/budgetData'

/**
 * useComputedLines
 * Returns budget lines enriched with `spent` and `remaining`
 * calculated live from approved payment requests.
 * This is the single source of truth for spend figures across
 * Dashboard, BudgetLines, and Analytics pages.
 */
export function useComputedLines(fundingFilter = 'All') {
    const { lines, loading: linesLoading } = useBudgetLines()
    const { requests, loading: reqsLoading } = usePaymentRequests()
    const loading = linesLoading || reqsLoading

    // ── Aggregation Logic ──────────────────────────────────────────────────
    const spentByLineId = useMemo(() => {
        const map = {}
        if (!requests?.length) return map

        requests.forEach((r) => {
            // Only aggregate "Approved" requests for the 2026 budget
            if (String(r.status).toLowerCase() === 'approved' && r.year === 2026) {
                // Determine which line to deduct from
                // Prefer explicit budgetLineId from DB, fallback to code-matching utility
                const lineId = r.budgetLineId || findBudgetLineId(r)
                
                if (lineId) {
                    const amount = Number(r.amount) || 0
                    map[lineId] = (map[lineId] || 0) + amount
                }
            }
        })
        return map
    }, [requests])

    // ── Enrichment ──────────────────────────────────────────────────────────
    const enrichedLines = useMemo(() => {
        if (!lines?.length) return []
        return lines.map((line) => {
            const spent     = Number(spentByLineId[line.id]) || 0
            const totalCost = Number(line.totalCost) || 0
            const remaining = Math.max(0, totalCost - spent)
            return {
                ...line,
                spent,
                remaining,
                pctUsed: totalCost > 0 ? (spent / totalCost) * 100 : 0
            }
        })
    }, [lines, spentByLineId])

    // ── Global Stats & Filters ──────────────────────────────────────────────
    const filteredLines = useMemo(() =>
        fundingFilter === 'All'
            ? enrichedLines
            : enrichedLines.filter((l) => l.fundingSource === fundingFilter),
        [enrichedLines, fundingFilter]
    )

    const totalBudget = useMemo(() =>
        filteredLines.reduce((s, l) => s + (Number(l.totalCost) || 0), 0),
        [filteredLines]
    )

    const totalSpent = useMemo(() =>
        filteredLines.reduce((s, l) => s + (Number(l.spent) || 0), 0),
        [filteredLines]
    )

    const remaining = useMemo(() => Math.max(0, totalBudget - totalSpent), [totalBudget, totalSpent])

    const pctUsed = useMemo(() =>
        totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
        [totalBudget, totalSpent]
    )

    return {
        lines: enrichedLines,       // all lines with computed spend
        filteredLines,              // current filtered set
        spentByLineId,
        totalBudget,
        totalSpent,
        remaining,
        pctUsed,
        loading,
    }
}
