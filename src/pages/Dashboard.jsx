import React, { useMemo, useState } from 'react'
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
    PieChart, Pie, Cell, Sector,
} from 'recharts'
import { Wallet, TrendingDown, PiggyBank, Percent, ArrowRight, Loader2 } from 'lucide-react'
import StatCard from '../components/StatCard'
import { useBudgetLines } from '../hooks/useBudgetLines'
import { usePaymentRequests } from '../hooks/usePaymentRequests'
import { computeSummary, formatZMW } from '../data/budgetData'
import { isSupabaseConfigured } from '../lib/supabaseClient'

const COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#15803d', '#166534']

const PILLAR_SHORT = {
    'Civic Education and Voter Information': 'Civic Ed.',
    'Democratic Governance and Human Rights': 'Democracy',
    'Strengthening Communities': 'Communities',
    'Operations': 'Operations',
}

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-card-lg text-xs">
            <p className="font-semibold text-gray-700 mb-1">{label}</p>
            {payload.map((p) => (
                <p key={p.name} style={{ color: p.color }} className="flex justify-between gap-4">
                    <span>{p.name}</span>
                    <span className="font-bold">{formatZMW(p.value)}</span>
                </p>
            ))}
        </div>
    )
}

const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props
    return (
        <g>
            <text x={cx} y={cy - 10} textAnchor="middle" fill="#111827" fontSize={14} fontWeight={700}>{payload.name}</text>
            <text x={cx} y={cy + 10} textAnchor="middle" fill="#6b7280" fontSize={11}>{(percent * 100).toFixed(1)}%</text>
            <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6} startAngle={startAngle} endAngle={endAngle} fill={fill} />
            <Sector cx={cx} cy={cy} innerRadius={innerRadius - 4} outerRadius={innerRadius - 1} startAngle={startAngle} endAngle={endAngle} fill={fill} />
        </g>
    )
}

export default function Dashboard({ fundingFilter }) {
    const [activePieIndex, setActivePieIndex] = useState(0)
    const { lines, loading: linesLoading } = useBudgetLines()
    const { requests, loading: requestsLoading } = usePaymentRequests()

    const filtered = useMemo(() =>
        fundingFilter === 'All' ? lines : lines.filter((l) => l.fundingSource === fundingFilter),
        [lines, fundingFilter]
    )

    const { totalBudget, totalSpent, remaining, pctUsed } = useMemo(
        () => computeSummary(filtered), [filtered]
    )

    const pillarData = useMemo(() => {
        const map = {}
        filtered.forEach(({ strategicPillar, totalCost, spent }) => {
            const key = PILLAR_SHORT[strategicPillar] || strategicPillar
            if (!map[key]) map[key] = { name: key, Budget: 0, Spent: 0 }
            map[key].Budget += totalCost
            map[key].Spent += spent || 0
        })
        return Object.values(map)
    }, [filtered])

    const pieData = useMemo(() => {
        const map = {}
        filtered.forEach(({ fundingSource, totalCost }) => {
            map[fundingSource] = (map[fundingSource] || 0) + totalCost
        })
        return Object.entries(map).map(([name, value]) => ({ name, value }))
    }, [filtered])

    const recentRequests = useMemo(() =>
        [...requests].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
        [requests]
    )

    const statusBadge = (s) =>
        s === 'Approved' ? 'badge-green' :
            s === 'Rejected' ? 'badge-red' : 'badge-amber'

    const loading = linesLoading || requestsLoading

    return (
        <div className="p-6 space-y-6 animate-fade-in-up">
            {/* Live data badge */}
            <div className="flex items-center gap-2">
                {isSupabaseConfigured ? (
                    <span className="badge badge-green gap-1">
                        <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />
                        Live Data
                    </span>
                ) : (
                    <span className="badge badge-amber">Sample Data — Configure Supabase to go live</span>
                )}
                {loading && <Loader2 size={12} className="animate-spin text-gray-400" />}
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard label="Total Budget" value={formatZMW(totalBudget)} sub="ZMW 2026 Annual Budget" icon={Wallet} color="green" delay={0} />
                <StatCard label="Total Spent" value={formatZMW(totalSpent)} sub="Approved requests deducted" icon={TrendingDown} color="red" delay={60} />
                <StatCard label="Remaining" value={formatZMW(remaining)} sub="Available balance" icon={PiggyBank} color="blue" delay={120} />
                <StatCard label="% Utilised" value={`${pctUsed.toFixed(1)}%`} sub="Budget burn rate" icon={Percent} color="amber" delay={180} />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-card border border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-700 mb-4">Budget vs Spent by Strategic Pillar</h2>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={pillarData} barCategoryGap="30%" barGap={4}>
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                            <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} width={45} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Bar dataKey="Budget" fill="#bbf7d0" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Spent" fill="#16a34a" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 flex flex-col">
                    <h2 className="text-sm font-semibold text-gray-700 mb-4">Budget by Funding Source</h2>
                    <div className="flex-1 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value"
                                    activeIndex={activePieIndex} activeShape={renderActiveShape}
                                    onMouseEnter={(_, idx) => setActivePieIndex(idx)}>
                                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-col gap-1 mt-2">
                        {pieData.map((d, i) => (
                            <div key={d.name} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                                    <span className="text-gray-600">{d.name}</span>
                                </div>
                                <span className="font-semibold text-gray-800">{formatZMW(d.value)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Payment Requests */}
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-700">Recent Payment Requests</h2>
                    <a href="/payment-requests" className="text-xs text-primary-600 font-medium hover:underline flex items-center gap-1">
                        View all <ArrowRight size={12} />
                    </a>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr>{['ID', 'Name', 'Budget Code', 'Amount', 'Status', 'Date'].map((h) => <th key={h} className="table-th">{h}</th>)}</tr>
                        </thead>
                        <tbody>
                            {recentRequests.map((req) => (
                                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="table-td font-mono text-xs">{req.id}</td>
                                    <td className="table-td font-medium">{req.name}</td>
                                    <td className="table-td font-mono text-xs text-gray-500">{req.budgetCode}</td>
                                    <td className="table-td font-semibold">{formatZMW(req.amount)}</td>
                                    <td className="table-td"><span className={statusBadge(req.status)}>{req.status}</span></td>
                                    <td className="table-td text-gray-400">{req.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
