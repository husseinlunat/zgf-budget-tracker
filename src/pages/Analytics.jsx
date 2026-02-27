import React, { useMemo } from 'react'
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import { Loader2 } from 'lucide-react'
import { useBudgetLines } from '../hooks/useBudgetLines'
import { formatZMW } from '../data/budgetData'

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
                    <span>{p.name}</span><span className="font-bold">{formatZMW(p.value)}</span>
                </p>
            ))}
        </div>
    )
}

export default function Analytics({ fundingFilter }) {
    const { lines, loading } = useBudgetLines()

    const filtered = useMemo(() =>
        fundingFilter === 'All' ? lines : lines.filter((l) => l.fundingSource === fundingFilter),
        [lines, fundingFilter]
    )

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
        filtered.forEach(({ strategicPillar, totalCost, spent }) => {
            const key = PILLAR_SHORT[strategicPillar] || strategicPillar
            if (!map[key]) map[key] = { name: key, Budget: 0, Spent: 0, Remaining: 0 }
            map[key].Budget += totalCost
            map[key].Spent += spent || 0
            map[key].Remaining += totalCost - (spent || 0)
        })
        return Object.values(map)
    }, [filtered])

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
    )
}
