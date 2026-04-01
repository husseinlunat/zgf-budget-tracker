import React, { useMemo } from 'react'
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell, Sector
} from 'recharts'
import { Loader2 } from 'lucide-react'
import { useBudgetLines } from '../hooks/useBudgetLines'
import { usePaymentRequests } from '../hooks/usePaymentRequests'
import { formatZMW } from '../data/budgetData'

const PILLAR_SHORT = {
    'Civic Education and Voter Information': 'Civic Ed.',
    'Democratic Governance and Human Rights': 'Democracy',
    'Strengthening Communities': 'Communities',
    'Operations': 'Operations',
    'Supporting CSOs': 'CSOs (Grants)'
}

const COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#15803d', '#166534']

const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props
    return (
        <g>
            <text x={cx} y={cy - 12} textAnchor="middle" fill="#111827" fontSize={16} fontWeight={700}>{payload.name}</text>
            <text x={cx} y={cy + 8} textAnchor="middle" fill="#6b7280" fontSize={12}>{(percent * 100).toFixed(1)}%</text>
            <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} />
            <Sector cx={cx} cy={cy} innerRadius={innerRadius - 6} outerRadius={innerRadius - 2} startAngle={startAngle} endAngle={endAngle} fill={fill} />
        </g>
    )
}

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-card-lg text-xs">
            <p className="font-semibold text-gray-700 mb-1">{label}</p>
            {payload.map((p) => (
                <p key={p.name} style={{ color: p.color }} className="flex justify-between gap-4">
                    <span>{p.name}</span><span className="font-bold">{formatZMW(p.value)}</span>
                </p>
            ))}
        </div>
    )
}

export default function Analytics({ fundingFilter }) {
    const { lines, loading: linesLoading } = useBudgetLines()
    const { requests, loading: reqsLoading } = usePaymentRequests()
    const [personFilter, setPersonFilter] = React.useState('All')
    const [categoryFilter, setCategoryFilter] = React.useState('All')
    const [statusFilter, setStatusFilter] = React.useState('All')
    const loading = linesLoading || reqsLoading

    const requesters = useMemo(() => {
        const set = new Set(requests.map(r => r.requestedBy?.trim()).filter(Boolean))
        return ['All', ...Array.from(set).sort()]
    }, [requests])

    const expenseCategories = useMemo(() => {
        const set = new Set(lines.map(l => l.odooCategory).filter(Boolean))
        return ['All', ...Array.from(set).sort()]
    }, [lines])

    const filtered = useMemo(() =>
        fundingFilter === 'All' ? lines : lines.filter((l) => l.fundingSource === fundingFilter),
        [lines, fundingFilter]
    )

    const filteredRequests = useMemo(() => {
        return requests.filter(r => {
            const line = lines.find(l => l.id === r.budgetLineId)
            const matchesPerson = personFilter === 'All' || r.requestedBy?.trim() === personFilter
            const matchesStatus = statusFilter === 'All' || r.status === statusFilter
            const matchesCategory = categoryFilter === 'All' || line?.odooCategory === categoryFilter
            const matchesFunding = fundingFilter === 'All' || line?.fundingSource === fundingFilter
            return matchesPerson && matchesStatus && matchesCategory && matchesFunding
        })
    }, [requests, lines, personFilter, statusFilter, categoryFilter, fundingFilter])

    const requestAnalytics = useMemo(() => {
        const categories = new Set()
        const personMap = {}
        const lineMap = Object.fromEntries(lines.map(l => [l.id, l]))

        filteredRequests.forEach(req => {
            const line = lineMap[req.budgetLineId]
            const category = line?.odooCategory || 'Other'
            const person = req.requestedBy?.trim() || 'Unknown'
            categories.add(category)
            if (!personMap[person]) personMap[person] = { name: person, total: 0 }
            personMap[person][category] = (personMap[person][category] || 0) + req.amount
            personMap[person].total += req.amount
        })

        const sortedData = Object.values(personMap).sort((a, b) => b.total - a.total).slice(0, 8)
        return { data: sortedData, categories: Array.from(categories) }
    }, [filteredRequests, lines])

    const quarterData = useMemo(() => {
        const t = { q1: 0, q2: 0, q3: 0, q4: 0 }
        filtered.forEach(({ q1, q2, q3, q4 }) => { t.q1 += q1 || 0; t.q2 += q2 || 0; t.q3 += q3 || 0; t.q4 += q4 || 0 })
        return [
            { quarter: 'Q1 (Jan–Mar)', Planned: t.q1 },
            { quarter: 'Q2 (Apr–Jun)', Planned: t.q2 },
            { quarter: 'Q3 (Jul–Sep)', Planned: t.q3 },
            { quarter: 'Q4 (Oct–Dec)', Planned: t.q4 },
        ]
    }, [filtered])

    const pillarData = useMemo(() => {
        const map = {}
        const spentMap = {}
        filteredRequests.forEach(r => {
            if (r.status === 'Approved') {
                spentMap[r.budgetLineId] = (spentMap[r.budgetLineId] || 0) + r.amount
            }
        })

        filtered.forEach(({ id, strategicPillar, totalCost }) => {
            const key = PILLAR_SHORT[strategicPillar] || strategicPillar
            if (!map[key]) map[key] = { name: key, Budget: 0, Spent: 0, Remaining: 0 }
            map[key].Budget += totalCost
            map[key].Spent += spentMap[id] || 0
            map[key].Remaining += totalCost - (spentMap[id] || 0)
        })
        return Object.values(map)
    }, [filtered, filteredRequests])

    const donutData = useMemo(() => {
        const map = {}
        const spentMap = {}
        filteredRequests.forEach(r => {
            if (r.status === 'Approved') {
                spentMap[r.budgetLineId] = (spentMap[r.budgetLineId] || 0) + r.amount
            }
        })

        filtered.forEach(({ id, fundingSource, totalCost }) => {
            const spent = spentMap[id] || 0
            const rem = totalCost - spent
            if (rem > 0) {
                map[fundingSource] = (map[fundingSource] || 0) + rem
            }
        })
        return Object.entries(map).map(([name, value]) => ({ name, value }))
    }, [filtered, filteredRequests])

    const [activePieIndex, setActivePieIndex] = React.useState(0)

    const top5 = useMemo(() =>
        [...filtered].sort((a, b) => b.totalCost - a.totalCost).slice(0, 5),
        [filtered]
    )

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 size={28} className="animate-spin text-primary-400" />
        </div>
    )

    return (
        <div className="p-6 space-y-6 animate-fade-in-up">
            <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                        <Loader2 size={16} className={loading ? 'animate-spin' : ''} />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-gray-900 leading-tight">Smart Analytics</h1>
                        <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">Multi-Parameter Cross Filtering</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Requester</label>
                        <select className="input-field py-1 px-3 text-xs min-w-[140px]" value={personFilter} onChange={(e) => setPersonFilter(e.target.value)}>
                            {requesters.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Expense Type</label>
                        <select className="input-field py-1 px-3 text-xs min-w-[140px]" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                            {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Status</label>
                        <select className="input-field py-1 px-3 text-xs min-w-[120px]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            {['All', 'Approved', 'Pending', 'Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Quarter Timeline */}
            <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">Quarterly Planned Budget Timeline</h2>
                <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={quarterData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="quarter" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} width={50} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Line type="monotone" dataKey="Planned" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 4, fill: '#16a34a' }} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Stacked Bar */}
            <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">Budget Breakdown by Strategic Pillar</h2>
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={pillarData} barCategoryGap="35%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} width={50} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="Spent" stackId="a" fill="#16a34a" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="Remaining" stackId="a" fill="#bbf7d0" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Donut Chart */}
                <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 flex flex-col">
                    <h2 className="text-sm font-semibold text-gray-700 mb-4">Remaining Budget Distribution</h2>
                    <div className="flex-1 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={donutData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} dataKey="value"
                                    activeIndex={activePieIndex} activeShape={renderActiveShape}
                                    onMouseEnter={(_, idx) => setActivePieIndex(idx)}>
                                    {donutData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top 5 */}
                <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-700 mb-4">Top 5 Activities by Budget Allocation</h2>
                    <div className="space-y-3">
                        {top5.map((line, i) => {
                            const pct = top5[0].totalCost > 0 ? (line.totalCost / top5[0].totalCost) * 100 : 0
                            return (
                                <div key={line.id} className="flex items-center gap-3">
                                    <span className="w-5 text-xs font-bold text-gray-400 text-right">{i + 1}</span>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-xs mb-0.5">
                                            <span className="font-medium text-gray-700 truncate max-w-[60%]">{line.activity}</span>
                                            <span className="font-bold text-gray-800">{formatZMW(line.totalCost)}</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
                                                style={{ width: `${pct}%` }} />
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-0.5">{line.fundingSource} · {line.strategicPillar}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Cross Analytics: Requester & Expense Type */}
            <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">Requests by Person & Expense Type (Top 8)</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={requestAnalytics.data} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={true} vertical={false} />
                        <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#4b5563' }} axisLine={false} tickLine={false} width={120} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 11, paddingTop: '10px' }} />
                        {requestAnalytics.categories.map((cat, i) => (
                            <Bar key={cat} dataKey={cat} stackId="a" fill={COLORS[i % COLORS.length]} radius={
                                // Just round the edges generically or let Recharts handle default stacked rounding
                                undefined
                            }/>
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
