import React, { useState, useMemo } from 'react'
import { Search, Filter, ChevronRight, ArrowUpDown, Loader2 } from 'lucide-react'
import BudgetDetailPanel from '../components/BudgetDetailPanel'
import { useBudgetLines } from '../hooks/useBudgetLines'
import { usePaymentRequests } from '../hooks/usePaymentRequests'
import { formatZMW, STRATEGIC_PILLARS } from '../data/budgetData'

function StatusPill({ pct }) {
    if (pct > 100) return <span className="badge badge-red">Overspent</span>
    if (pct > 80) return <span className="badge badge-amber">At Risk</span>
    if (pct > 0) return <span className="badge badge-blue">In Progress</span>
    return <span className="badge badge-gray">Not Started</span>
}

function UtilBar({ pct }) {
    const color = pct > 100 ? 'bg-red-500' : pct > 80 ? 'bg-amber-400' : 'bg-primary-500'
    return (
        <div className="flex items-center gap-2 min-w-[80px]">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.min(pct, 100)}%` }} />
            </div>
            <span className="text-xs text-gray-500 w-8 text-right">{pct.toFixed(0)}%</span>
        </div>
    )
}

export default function BudgetLines({ fundingFilter }) {
    const [search, setSearch] = useState('')
    const [pillarFilter, setPillar] = useState('All')
    const [sortField, setSortField] = useState('totalCost')
    const [sortDir, setSortDir] = useState('desc')
    const [selected, setSelected] = useState(null)

    const { lines, loading } = useBudgetLines()
    const { requests } = usePaymentRequests()

    const filtered = useMemo(() => {
        let data = lines
        if (fundingFilter !== 'All') data = data.filter((l) => l.fundingSource === fundingFilter)
        if (pillarFilter !== 'All') data = data.filter((l) => l.strategicPillar === pillarFilter)
        if (search.trim()) data = data.filter((l) =>
            l.activity.toLowerCase().includes(search.toLowerCase()) ||
            l.budgetCode?.toLowerCase().includes(search.toLowerCase()) ||
            l.zgfCode?.toLowerCase().includes(search.toLowerCase())
        )
        return [...data].sort((a, b) => {
            const mul = sortDir === 'asc' ? 1 : -1
            return typeof a[sortField] === 'number'
                ? mul * (a[sortField] - b[sortField])
                : mul * String(a[sortField]).localeCompare(String(b[sortField]))
        })
    }, [lines, fundingFilter, pillarFilter, search, sortField, sortDir])

    const toggleSort = (field) => {
        if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
        else { setSortField(field); setSortDir('desc') }
    }

    return (
        <div className="p-6 space-y-4 animate-fade-in-up">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input className="input-field pl-8" placeholder="Search activity, budget code, ZGF code…"
                        value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="flex items-center gap-1.5">
                    <Filter size={13} className="text-gray-400" />
                    <select className="select-field w-48" value={pillarFilter} onChange={(e) => setPillar(e.target.value)}>
                        {STRATEGIC_PILLARS.map((p) => <option key={p}>{p}</option>)}
                    </select>
                </div>
                {loading
                    ? <Loader2 size={14} className="animate-spin text-gray-400" />
                    : <span className="text-xs text-gray-400">{filtered.length} line items</span>
                }
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                {[
                                    { key: 'zgfCode', label: 'ZGF Code' },
                                    { key: 'activity', label: 'Activity' },
                                    { key: 'strategicPillar', label: 'Pillar' },
                                    { key: 'totalCost', label: 'Budget' },
                                    { key: 'spent', label: 'Spent' },
                                    { key: 'remaining', label: 'Remaining' },
                                    { key: 'pct', label: '% Used' },
                                    { key: 'status', label: 'Status' },
                                ].map(({ key, label }) => (
                                    <th key={key} className="table-th cursor-pointer hover:text-primary-600 select-none"
                                        onClick={() => key !== 'status' && key !== 'pct' && toggleSort(key)}>
                                        <span className="flex items-center gap-1">
                                            {label}
                                            {sortField === key && <ArrowUpDown size={10} className="text-primary-600" />}
                                        </span>
                                    </th>
                                ))}
                                <th className="table-th w-8" />
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((line) => {
                                const pct = line.totalCost > 0 ? ((line.spent || 0) / line.totalCost) * 100 : 0
                                return (
                                    <tr key={line.id} className="hover:bg-primary-50/50 transition-colors cursor-pointer group"
                                        onClick={() => setSelected(line)}>
                                        <td className="table-td font-mono text-xs text-primary-700 font-semibold">{line.zgfCode}</td>
                                        <td className="table-td max-w-[200px]">
                                            <p className="font-medium text-gray-800 truncate">{line.activity}</p>
                                            <p className="text-[10px] text-gray-400">{line.budgetCode}</p>
                                        </td>
                                        <td className="table-td text-xs"><span className="badge badge-green">{line.fundingSource}</span></td>
                                        <td className="table-td font-semibold">{formatZMW(line.totalCost)}</td>
                                        <td className="table-td text-red-600 font-medium">{formatZMW(line.spent || 0)}</td>
                                        <td className="table-td text-primary-700 font-medium">{formatZMW(line.remaining ?? line.totalCost)}</td>
                                        <td className="table-td"><UtilBar pct={pct} /></td>
                                        <td className="table-td"><StatusPill pct={pct} /></td>
                                        <td className="table-td text-gray-300 group-hover:text-primary-500 transition-colors">
                                            <ChevronRight size={14} />
                                        </td>
                                    </tr>
                                )
                            })}
                            {!loading && filtered.length === 0 && (
                                <tr><td colSpan={9} className="text-center py-12 text-gray-400 text-sm">No budget lines match your filters.</td></tr>
                            )}
                            {loading && (
                                <tr><td colSpan={9} className="text-center py-12">
                                    <Loader2 size={20} className="animate-spin text-primary-400 mx-auto" />
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selected && (
                <BudgetDetailPanel line={selected} requests={requests} onClose={() => setSelected(null)} />
            )}
        </div>
    )
}
