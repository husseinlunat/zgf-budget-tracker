import React, { useMemo } from 'react'
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid, Legend,
    PieChart, Pie, Cell, Sector,
    LineChart, Line
} from 'recharts'
import { TrendingUp, DollarSign, PieChart as PieIcon, BarChart2, AlertCircle } from 'lucide-react'
import { useComputedLines } from '../hooks/useComputedLines'
import { usePaymentRequests } from '../hooks/usePaymentRequests'
import { formatZMW } from '../data/budgetData'

// ── Colour palettes ────────────────────────────────────────────────────────────
const FS_COLORS = {
    'Comic Relief': '#16a34a',
    'MOTTIII':      '#0284c7',
    'KaluluII':     '#d97706',
    'ZGF':          '#7c3aed',
}
const SPARE_COLORS = ['#16a34a','#0284c7','#d97706','#7c3aed','#db2777','#0891b2','#65a30d','#ea580c']

// ── Amount formatter ──────────────────────────────────────────────────────────
const fmtK = (v) => `K ${(v / 1_000).toFixed(0)}K`
const fmtM = (v) => v >= 1_000_000 ? `K ${(v / 1_000_000).toFixed(2)}M` : `K ${(v / 1_000).toFixed(1)}K`

// ── Active pie shape ──────────────────────────────────────────────────────────
const ActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props
    return (
        <g>
            <text x={cx} y={cy - 10} textAnchor="middle" fill="#111827" fontSize={13} fontWeight={700}>{payload.name}</text>
            <text x={cx} y={cy + 8}  textAnchor="middle" fill="#6b7280" fontSize={11}>{(percent * 100).toFixed(1)}%</text>
            <text x={cx} y={cy + 24} textAnchor="middle" fill="#374151" fontSize={11} fontWeight={600}>{fmtM(payload.value)}</text>
            <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} />
            <Sector cx={cx} cy={cy} innerRadius={innerRadius - 4} outerRadius={innerRadius - 1} startAngle={startAngle} endAngle={endAngle} fill={fill} />
        </g>
    )
}

// ── Custom tooltip ────────────────────────────────────────────────────────────
const Tip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-lg text-xs min-w-[160px]">
            {label && <p className="font-bold text-gray-700 mb-2 border-b pb-1">{label}</p>}
            {payload.map((p) => (
                <div key={p.name} className="flex justify-between gap-6 py-0.5">
                    <span style={{ color: p.color }}>{p.name}</span>
                    <span className="font-bold text-gray-800">{formatZMW(p.value)}</span>
                </div>
            ))}
        </div>
    )
}

// ── Stat tile ─────────────────────────────────────────────────────────────────
const StatTile = ({ label, value, sub, color = '#16a34a', icon: Icon }) => (
    <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 flex items-start gap-4">
        <div className="p-2.5 rounded-xl" style={{ background: `${color}18` }}>
            <Icon size={18} style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
            <p className="text-xl font-extrabold text-gray-900 leading-tight truncate">{value}</p>
            {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
        </div>
    </div>
)

// ── Progress bar row ──────────────────────────────────────────────────────────
const ProgressRow = ({ label, spent, budget, color }) => {
    const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0
    const over = spent > budget
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs">
                <span className="font-semibold text-gray-700 truncate max-w-[55%]">{label}</span>
                <span className={`font-bold ${over ? 'text-red-600' : 'text-gray-800'}`}>{formatZMW(spent)} / {formatZMW(budget)}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: over ? '#dc2626' : color }} />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400">
                <span>{pct.toFixed(1)}% used</span>
                <span>Remaining: {formatZMW(Math.max(0, budget - spent))}</span>
            </div>
        </div>
    )
}

export default function Analytics({ fundingFilter }) {
    const { lines, filteredLines: scopedLines, totalBudget, totalSpent, loading } = useComputedLines(fundingFilter)
    const { requests } = usePaymentRequests()
    const [personFilter, setPersonFilter]   = React.useState('All')
    const [codeFilter, setCodeFilter]       = React.useState('All')
    const [activePieIdx, setActivePieIdx]   = React.useState(0)

    // ── Scoped by global funding filter ──────────────────────────────────────

    const scopedRequests = useMemo(() =>
        requests.filter(r => {
            const line = lines.find(l => l.id === r.budgetLineId)
            const fsMatch = fundingFilter === 'All' || (line?.fundingSource === fundingFilter) || (r.fundingSource === fundingFilter)
            const codeMatch = codeFilter === 'All' || r.budgetCode === codeFilter
            const personMatch = personFilter === 'All' || r.requestedBy?.trim() === personFilter
            return fsMatch && codeMatch && personMatch
        }),
        [requests, lines, fundingFilter, codeFilter, personFilter]
    )

    const approvedRequests = useMemo(() =>
        scopedRequests.filter(r => r.status === 'Approved'),
        [scopedRequests]
    )

    // ── Unique filterables ────────────────────────────────────────────────────
    const uniqueCodes = useMemo(() => {
        const set = new Set(requests.map(r => r.budgetCode).filter(Boolean))
        return ['All', ...Array.from(set).sort()]
    }, [requests])

    const uniquePersons = useMemo(() => {
        const set = new Set(requests.map(r => r.requestedBy?.trim()).filter(Boolean))
        return ['All', ...Array.from(set).sort()]
    }, [requests])

    // ── Grand totals ──────────────────────────────────────────────────────────
    const totalPending = useMemo(() =>
        scopedRequests.filter(r => r.status === 'Pending').reduce((s, r) => s + (r.amount || 0), 0),
        [scopedRequests]
    )

    // ── Funding source summary ────────────────────────────────────────────────
    const fsSummary = useMemo(() => {
        const budgetMap = {}
        scopedLines.forEach(l => {
            budgetMap[l.fundingSource] = (budgetMap[l.fundingSource] || 0) + (l.totalCost || 0)
        })
        const spentMap = {}
        approvedRequests.forEach(r => {
            const line = lines.find(l => l.id === r.budgetLineId)
            const fs = line?.fundingSource || r.fundingSource || 'Unknown'
            spentMap[fs] = (spentMap[fs] || 0) + (r.amount || 0)
        })
        const allFS = new Set([...Object.keys(budgetMap), ...Object.keys(spentMap)])
        return Array.from(allFS).map(fs => ({
            name: fs,
            Budget:    budgetMap[fs] || 0,
            Spent:     spentMap[fs] || 0,
            Remaining: Math.max(0, (budgetMap[fs] || 0) - (spentMap[fs] || 0)),
        }))
    }, [scopedLines, approvedRequests, lines])

    // Donut data = spent by funding source
    const donutData = useMemo(() =>
        fsSummary.filter(d => d.Spent > 0).map(d => ({ name: d.name, value: d.Spent })),
        [fsSummary]
    )

    // ── Spend by budget code ──────────────────────────────────────────────────
    const codeData = useMemo(() => {
        const spentMap = {}
        const budgetMap = {}

        // Budget from lines
        scopedLines.forEach(l => {
            if (l.budgetCode) {
                budgetMap[l.budgetCode] = (budgetMap[l.budgetCode] || 0) + (l.totalCost || 0)
            }
        })
        // Spent from approved requests
        approvedRequests.forEach(r => {
            if (r.budgetCode) {
                spentMap[r.budgetCode] = (spentMap[r.budgetCode] || 0) + (r.amount || 0)
            }
        })

        const allCodes = new Set([...Object.keys(budgetMap), ...Object.keys(spentMap)])
        return Array.from(allCodes)
            .map(code => ({
                code,
                Budget:    budgetMap[code] || 0,
                Spent:     spentMap[code] || 0,
                Remaining: Math.max(0, (budgetMap[code] || 0) - (spentMap[code] || 0)),
            }))
            .filter(d => d.Spent > 0)
            .sort((a, b) => b.Spent - a.Spent)
            .slice(0, 15)
    }, [scopedLines, approvedRequests])

    // ── Spend by requester ────────────────────────────────────────────────────
    const requesterData = useMemo(() => {
        const map = {}
        approvedRequests.forEach(r => {
            const person = r.requestedBy?.trim() || 'Unknown'
            if (!map[person]) map[person] = { name: person, total: 0 }
            const fs = lines.find(l => l.id === r.budgetLineId)?.fundingSource || r.fundingSource || 'Other'
            map[person][fs] = (map[person][fs] || 0) + r.amount
            map[person].total += r.amount
        })
        return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 8)
    }, [approvedRequests, lines])

    const requesterFS = useMemo(() => {
        const set = new Set()
        approvedRequests.forEach(r => {
            const fs = lines.find(l => l.id === r.budgetLineId)?.fundingSource || r.fundingSource
            if (fs) set.add(fs)
        })
        return Array.from(set)
    }, [approvedRequests, lines])

    // ── Quarterly planned ─────────────────────────────────────────────────────
    const quarterData = useMemo(() => {
        const t = { q1: 0, q2: 0, q3: 0, q4: 0 }
        scopedLines.forEach(({ q1, q2, q3, q4 }) => {
            t.q1 += q1 || 0; t.q2 += q2 || 0; t.q3 += q3 || 0; t.q4 += q4 || 0
        })
        return [
            { quarter: 'Q1 (Jan–Mar)', Planned: t.q1 },
            { quarter: 'Q2 (Apr–Jun)', Planned: t.q2 },
            { quarter: 'Q3 (Jul–Sep)', Planned: t.q3 },
            { quarter: 'Q4 (Oct–Dec)', Planned: t.q4 },
        ]
    }, [scopedLines])

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                <p className="text-xs text-gray-400 font-medium">Loading analytics…</p>
            </div>
        </div>
    )

    return (
        <div className="p-6 space-y-6 animate-fade-in-up">

            {/* ── Filters ────────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-sm font-bold text-gray-900 leading-tight">Smart Analytics</h1>
                    <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">
                        {approvedRequests.length} approved requests · {formatZMW(totalSpent)} total spend
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Requester</label>
                        <select className="input-field py-1 px-3 text-xs min-w-[140px]" value={personFilter} onChange={e => setPersonFilter(e.target.value)}>
                            {uniquePersons.map(p => <option key={p}>{p}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Budget Code</label>
                        <select className="input-field py-1 px-3 text-xs min-w-[120px]" value={codeFilter} onChange={e => setCodeFilter(e.target.value)}>
                            {uniqueCodes.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* ── KPI tiles ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatTile label="Total Budget"    value={fmtM(totalBudget)}  sub={`${scopedLines.length} budget lines`}       color="#16a34a" icon={DollarSign} />
                <StatTile label="Total Spent"     value={fmtM(totalSpent)}   sub={`${((totalSpent/totalBudget||0)*100).toFixed(1)}% of budget`} color="#0284c7" icon={TrendingUp} />
                <StatTile label="Remaining"       value={fmtM(Math.max(0, totalBudget - totalSpent))} sub="unspent budget"   color="#7c3aed" icon={PieIcon} />
                <StatTile label="Pending Requests" value={fmtM(totalPending)} sub={`${scopedRequests.filter(r=>r.status==='Pending').length} requests`} color="#d97706" icon={AlertCircle} />
            </div>

            {/* ── Funding Source Summary Table ───────────────────────────── */}
            <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <BarChart2 size={15} className="text-primary-500" />
                    Funding Source: Budget vs Actual Spend
                </h2>
                <div className="space-y-4">
                    {fsSummary.map(fs => (
                        <ProgressRow
                            key={fs.name}
                            label={fs.name}
                            spent={fs.Spent}
                            budget={fs.Budget}
                            color={FS_COLORS[fs.name] || '#16a34a'}
                        />
                    ))}
                </div>
                {/* Summary table */}
                <div className="mt-5 overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-gray-100">
                                {['Funding Source','Budget','Spent','Remaining','% Used'].map(h => (
                                    <th key={h} className="text-left py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {fsSummary.map(fs => {
                                const pct = fs.Budget > 0 ? (fs.Spent / fs.Budget * 100) : 0
                                const over = fs.Spent > fs.Budget
                                return (
                                    <tr key={fs.name} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="py-2.5 px-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ background: FS_COLORS[fs.name] || '#ccc' }} />
                                                <span className="font-semibold text-gray-800">{fs.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-3 font-mono text-gray-700">{formatZMW(fs.Budget)}</td>
                                        <td className="py-2.5 px-3 font-mono font-bold text-gray-900">{formatZMW(fs.Spent)}</td>
                                        <td className="py-2.5 px-3 font-mono text-gray-600">{formatZMW(fs.Remaining)}</td>
                                        <td className="py-2.5 px-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${over ? 'bg-red-100 text-red-700' : pct > 80 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                                {pct.toFixed(1)}%
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })}
                            {/* Totals row */}
                            <tr className="bg-gray-50 font-bold border-t-2 border-gray-200">
                                <td className="py-2.5 px-3 text-gray-900">TOTAL</td>
                                <td className="py-2.5 px-3 font-mono text-gray-900">{formatZMW(totalBudget)}</td>
                                <td className="py-2.5 px-3 font-mono text-gray-900">{formatZMW(totalSpent)}</td>
                                <td className="py-2.5 px-3 font-mono text-gray-900">{formatZMW(Math.max(0, totalBudget - totalSpent))}</td>
                                <td className="py-2.5 px-3">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                                        {totalBudget > 0 ? (totalSpent / totalBudget * 100).toFixed(1) : 0}%
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Funding Source bar chart ───────────────────────────────── */}
            <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">Budget vs Spent by Funding Source</h2>
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={fsSummary} barCategoryGap="30%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={fmtK} tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} width={55} />
                        <Tooltip content={<Tip />} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="Budget"    fill="#bbf7d0" radius={[4,4,0,0]} />
                        <Bar dataKey="Spent"     fill="#16a34a" radius={[4,4,0,0]} />
                        <Bar dataKey="Remaining" fill="#0284c7" radius={[4,4,0,0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* ── Two columns: donut + spend donut ──────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Spent donut */}
                <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-700 mb-1">Actual Spend Distribution</h2>
                    <p className="text-[10px] text-gray-400 mb-3">By funding source (approved requests only)</p>
                    <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                            <Pie data={donutData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} dataKey="value"
                                activeIndex={activePieIdx} activeShape={ActiveShape}
                                onMouseEnter={(_, i) => setActivePieIdx(i)}>
                                {donutData.map((d, i) => <Cell key={i} fill={FS_COLORS[d.name] || SPARE_COLORS[i]} />)}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-3 mt-2 justify-center">
                        {donutData.map((d, i) => (
                            <div key={d.name} className="flex items-center gap-1.5 text-xs">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ background: FS_COLORS[d.name] || SPARE_COLORS[i] }} />
                                <span className="text-gray-600">{d.name}</span>
                                <span className="font-bold text-gray-800">{formatZMW(d.value)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quarterly plan */}
                <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-700 mb-1">Quarterly Planned Budget</h2>
                    <p className="text-[10px] text-gray-400 mb-3">From budget lines (planned, not actuals)</p>
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={quarterData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="quarter" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                            <YAxis tickFormatter={fmtK} tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} width={55} />
                            <Tooltip content={<Tip />} />
                            <Line type="monotone" dataKey="Planned" stroke="#16a34a" strokeWidth={2.5}
                                dot={{ r: 4, fill: '#16a34a' }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ── Budget Code Breakdown ──────────────────────────────────── */}
            <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700 mb-1">Actual Spend by Budget Code (Top 15)</h2>
                <p className="text-[10px] text-gray-400 mb-4">Codes with approved payment requests — Budget vs Spent</p>
                {codeData.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-8">No approved requests match current filters</p>
                ) : (
                    <ResponsiveContainer width="100%" height={Math.max(300, codeData.length * 40)}>
                        <BarChart data={codeData} layout="vertical" margin={{ left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                            <XAxis type="number" tickFormatter={fmtK} tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                            <YAxis type="category" dataKey="code" tick={{ fontSize: 10, fill: '#4b5563' }} axisLine={false} tickLine={false} width={55} />
                            <Tooltip content={<Tip />} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Bar dataKey="Budget"    fill="#bbf7d0" radius={[0,3,3,0]} />
                            <Bar dataKey="Spent"     fill="#16a34a" radius={[0,3,3,0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* ── Top codes ranked list ─────────────────────────────────── */}
            <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">Top Budget Codes by Actual Spend</h2>
                <div className="space-y-3">
                    {codeData.slice(0, 10).map((d, i) => {
                        const pct = d.Budget > 0 ? (d.Spent / d.Budget) * 100 : 100
                        const over = d.Spent > d.Budget
                        return (
                            <div key={d.code} className="flex items-center gap-3">
                                <span className="w-5 text-xs font-bold text-gray-400 text-right shrink-0">{i + 1}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-gray-800 font-mono">{d.code}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">{formatZMW(d.Spent)}</span>
                                            {over && <span className="text-[10px] bg-red-100 text-red-600 font-bold px-1.5 rounded">OVER</span>}
                                        </div>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all"
                                            style={{ width: `${Math.min(pct, 100)}%`, background: over ? '#dc2626' : SPARE_COLORS[i % SPARE_COLORS.length] }} />
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-0.5">{pct.toFixed(1)}% of budget · {formatZMW(d.Budget)} planned</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* ── Spend by requester ────────────────────────────────────── */}
            <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">Spend by Requester (Top 8, approved only)</h2>
                {requesterData.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-8">No data for current filters</p>
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={requesterData} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={true} vertical={false} />
                            <XAxis type="number" tickFormatter={fmtK} tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#4b5563' }} axisLine={false} tickLine={false} width={120} />
                            <Tooltip content={<Tip />} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            {requesterFS.map((fs, i) => (
                                <Bar key={fs} dataKey={fs} stackId="a" fill={FS_COLORS[fs] || SPARE_COLORS[i]} radius={i === requesterFS.length - 1 ? [0,3,3,0] : undefined} />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    )
}
