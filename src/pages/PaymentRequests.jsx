import React, { useState, useMemo } from 'react'
import { Search, RefreshCw, CheckCircle2, Clock, XCircle, Info, Wifi, WifiOff, Loader2 } from 'lucide-react'
import { usePaymentRequests } from '../hooks/usePaymentRequests'
import { useBudgetLines } from '../hooks/useBudgetLines'
import { formatZMW } from '../data/budgetData'
import { isSupabaseConfigured } from '../lib/supabaseClient'
import { isSharePointConfigured, syncFromSharePoint } from '../lib/sharepointSync'

const STATUS_OPTS = ['All', 'Pending', 'Approved', 'Rejected']

function StatusBadge({ status }) {
    const map = { Approved: 'badge-green', Pending: 'badge-amber', Rejected: 'badge-red' }
    const icons = { Approved: <CheckCircle2 size={10} />, Pending: <Clock size={10} />, Rejected: <XCircle size={10} /> }
    return <span className={`badge ${map[status] || 'badge-gray'} gap-1`}>{icons[status]}{status}</span>
}

export default function PaymentRequests({ fundingFilter }) {
    const [search, setSearch] = useState('')
    const [statusF, setStatusF] = useState('All')
    const [syncing, setSyncing] = useState(false)
    const [syncResult, setSyncResult] = useState(null)
    const [info, setInfo] = useState(null)

    const { requests, loading, refetch } = usePaymentRequests()
    const { lines } = useBudgetLines()
    const lineMap = useMemo(() => Object.fromEntries(lines.map((l) => [l.id, l])), [lines])

    const filtered = useMemo(() => {
        let data = requests
        if (statusF !== 'All') data = data.filter((r) => r.status === statusF)
        if (search.trim()) data = data.filter((r) =>
            r.name.toLowerCase().includes(search.toLowerCase()) ||
            r.id.toLowerCase().includes(search.toLowerCase()) ||
            r.budgetCode?.toLowerCase().includes(search.toLowerCase())
        )
        if (fundingFilter !== 'All') {
            data = data.filter((r) => {
                const line = lineMap[r.budgetLineId]
                return line?.fundingSource === fundingFilter
            })
        }
        return [...data].sort((a, b) => new Date(b.date) - new Date(a.date))
    }, [requests, statusF, search, fundingFilter, lineMap])

    const totals = useMemo(() => ({
        pending: requests.filter(r => r.status === 'Pending').reduce((s, r) => s + r.amount, 0),
        approved: requests.filter(r => r.status === 'Approved').reduce((s, r) => s + r.amount, 0),
        rejected: requests.filter(r => r.status === 'Rejected').reduce((s, r) => s + r.amount, 0),
    }), [requests])

    const handleSync = async () => {
        setSyncing(true)
        setSyncResult(null)
        try {
            if (isSharePointConfigured && isSupabaseConfigured) {
                const result = await syncFromSharePoint()
                setSyncResult({ ok: true, message: `✓ Synced ${result.synced} items. ${result.approved} approvals deducted from budget.` })
                await refetch()
            } else {
                // Simulate sync in demo mode
                await new Promise((r) => setTimeout(r, 1500))
                setSyncResult({ ok: false, message: 'Demo mode — configure SharePoint + Supabase env vars to sync live data.' })
            }
        } catch (err) {
            setSyncResult({ ok: false, message: `Sync failed: ${err.message}` })
        } finally {
            setSyncing(false)
            setTimeout(() => setSyncResult(null), 6000)
        }
    }

    return (
        <div className="p-6 space-y-5 animate-fade-in-up">
            {/* Connection Status Banner */}
            <div className="flex flex-wrap items-start gap-3 p-4 bg-primary-50 border border-primary-200 rounded-xl">
                <div className="flex flex-col gap-1 flex-1">
                    <div className="flex items-center gap-2">
                        {isSharePointConfigured
                            ? <><Wifi size={13} className="text-primary-600" /><p className="text-xs font-semibold text-primary-700">SharePoint Connected</p></>
                            : <><WifiOff size={13} className="text-amber-600" /><p className="text-xs font-semibold text-amber-700">SharePoint — Phase 2</p></>
                        }
                        {isSupabaseConfigured
                            ? <span className="badge badge-green text-[10px]">Supabase Live</span>
                            : <span className="badge badge-amber text-[10px]">Supabase Offline</span>
                        }
                    </div>
                    <p className="text-xs text-primary-600/80">
                        {isSharePointConfigured
                            ? `Syncing from SharePoint list. When a request is Approved, the budget line is automatically deducted.`
                            : `Add VITE_GRAPH_CLIENT_ID, VITE_SHAREPOINT_SITE_ID and VITE_SHAREPOINT_LIST_ID to .env.local to connect your SharePoint Payment Requests list.`
                        }
                    </p>
                    {syncResult && (
                        <p className={`text-xs font-medium mt-1 ${syncResult.ok ? 'text-primary-700' : 'text-amber-700'}`}>
                            {syncResult.message}
                        </p>
                    )}
                </div>
                <button onClick={handleSync} disabled={syncing} className="btn-primary text-xs flex-shrink-0">
                    <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
                    {syncing ? 'Syncing…' : 'Sync from SharePoint'}
                </button>
            </div>

            {/* Summary Chips */}
            <div className="flex flex-wrap gap-3">
                {[
                    { label: 'Pending', val: totals.pending, cls: 'border-amber-200 bg-amber-50 text-amber-700' },
                    { label: 'Approved', val: totals.approved, cls: 'border-primary-200 bg-primary-50 text-primary-700' },
                    { label: 'Rejected', val: totals.rejected, cls: 'border-red-200 bg-red-50 text-red-700' },
                ].map(({ label, val, cls }) => (
                    <div key={label} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-medium ${cls}`}>
                        <span>{label}</span>
                        <span className="font-bold text-sm">{formatZMW(val)}</span>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input className="input-field pl-8" placeholder="Search by name, ID, or budget code…"
                        value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                    {STATUS_OPTS.map((s) => (
                        <button key={s} onClick={() => setStatusF(s)}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${statusF === s ? 'bg-white text-primary-700 shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-700'
                                }`}>{s}</button>
                    ))}
                </div>
                {loading
                    ? <Loader2 size={13} className="animate-spin text-gray-400" />
                    : <span className="text-xs text-gray-400">{filtered.length} requests</span>
                }
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                {['Item ID', 'Name', 'Budget Code', 'Budget Line', 'Year', 'Amount', 'Requested By', 'Date', 'Status'].map((h) => (
                                    <th key={h} className="table-th">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((req) => {
                                const line = lineMap[req.budgetLineId]
                                return (
                                    <tr key={req.id} className="hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => setInfo(req)}>
                                        <td className="table-td font-mono text-xs text-primary-700 font-semibold">{req.id}</td>
                                        <td className="table-td font-medium max-w-[180px]"><p className="truncate">{req.name}</p></td>
                                        <td className="table-td font-mono text-xs text-gray-500">{req.budgetCode}</td>
                                        <td className="table-td text-xs text-gray-500 max-w-[140px]"><p className="truncate">{line?.activity || req.budgetLineId || '—'}</p></td>
                                        <td className="table-td">{req.year}</td>
                                        <td className="table-td font-semibold text-gray-800">{formatZMW(req.amount)}</td>
                                        <td className="table-td text-gray-500">{req.requestedBy}</td>
                                        <td className="table-td text-gray-400">{req.date}</td>
                                        <td className="table-td"><StatusBadge status={req.status} /></td>
                                    </tr>
                                )
                            })}
                            {!loading && filtered.length === 0 && (
                                <tr><td colSpan={9} className="text-center py-12 text-gray-400 text-sm">No payment requests match your filters.</td></tr>
                            )}
                            {loading && (
                                <tr><td colSpan={9} className="text-center py-12"><Loader2 size={20} className="animate-spin text-primary-400 mx-auto" /></td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {info && (
                <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/25 backdrop-blur-sm" onClick={() => setInfo(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                        <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide">{info.id}</p>
                        <h3 className="text-base font-bold text-gray-900 mt-1">{info.name}</h3>
                        <div className="mt-4 space-y-2 text-sm">
                            {[
                                ['Budget Code', info.budgetCode],
                                ['Budget Line', lineMap[info.budgetLineId]?.activity || info.budgetLineId || '—'],
                                ['Year', info.year],
                                ['Amount', formatZMW(info.amount)],
                                ['Requested By', info.requestedBy],
                                ['Date', info.date],
                                ['Status', info.status],
                                ...(info.syncedAt ? [['Last Synced', new Date(info.syncedAt).toLocaleString()]] : []),
                            ].map(([k, v]) => (
                                <div key={k} className="flex justify-between">
                                    <span className="text-gray-500">{k}</span>
                                    <span className="font-medium text-gray-800">{v}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <StatusBadge status={info.status} />
                            {info.status === 'Approved' && (
                                <p className="mt-2 text-xs text-primary-600">
                                    ✓ {formatZMW(info.amount)} has been deducted from the linked budget line.
                                </p>
                            )}
                        </div>
                        <button className="btn-outline w-full justify-center mt-4 text-sm" onClick={() => setInfo(null)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    )
}
